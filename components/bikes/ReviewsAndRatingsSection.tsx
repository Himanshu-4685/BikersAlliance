'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiMessageSquare, FiUser } from 'react-icons/fi';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  variantId?: number;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
  };
}

interface BikeVariant {
  id: string | number;
  name: string;
  price: number;
}

interface Bike {
  id: string;
  name: string;
  variants: BikeVariant[];
  rating?: {
    average: number;
    count: number;
  };
  reviews?: Review[];
}

interface ReviewsAndRatingsSectionProps {
  bike: Bike;
  currentVariantId?: string | number;
}

export default function ReviewsAndRatingsSection({ bike, currentVariantId }: ReviewsAndRatingsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(bike.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(bike.rating || { average: 0, count: 0 });

  // Fetch reviews for the current variant
  const fetchReviews = async () => {
    const variantId = currentVariantId || bike.variants?.[0]?.id;
    if (!variantId) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/reviews?variant_id=${variantId}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
        // Update rating based on fetched reviews
        if (data.reviews && data.reviews.length > 0) {
          const totalRating = data.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
          setRating({
            average: Math.round((totalRating / data.reviews.length) * 10) / 10,
            count: data.reviews.length
          });
        }
      } else {
        setError('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [bike.variants, currentVariantId]);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews(); // Refresh reviews after submission
  };

  const renderStars = (rating: number, size = 'w-5 h-5') => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`${size} ${
              i < rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
          <p className="text-gray-600 mt-1">Share your experience with {bike.variants?.find(v => v.id === currentVariantId)?.name || bike.name}</p>
        </div>
        
        {rating.count > 0 && (
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-1">
              {renderStars(Math.floor(rating.average))}
              <span className="font-semibold text-lg">{rating.average}/5</span>
            </div>
            <p className="text-sm text-gray-500">Based on {rating.count} review{rating.count !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Write Review Button */}
      <div className="mb-6">
        {!showReviewForm ? (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            <FiMessageSquare className="w-4 h-4 mr-2" />
            Write a Review
          </button>
        ) : (
          <ReviewForm
            variantId={typeof currentVariantId === 'string' ? parseInt(currentVariantId) : currentVariantId || (typeof bike.variants?.[0]?.id === 'string' ? parseInt(bike.variants[0].id) : bike.variants?.[0]?.id || 0)}
            onReviewSubmitted={handleReviewSubmitted}
            onCancel={() => setShowReviewForm(false)}
          />
        )}
      </div>

      {/* Reviews List */}
      <div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating, 'w-4 h-4')}
                        <span className="text-sm text-gray-500">({review.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {review.title && review.title !== 'User Review' && (
                  <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                )}
                
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              </div>
            ))}
            
            {reviews.length >= 10 && (
              <div className="text-center pt-4">
                <button 
                  onClick={fetchReviews}
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to share your experience with {bike.variants?.find(v => v.id === currentVariantId)?.name || bike.name}
            </p>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Write the First Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}