import { useState } from 'react';
import { FiStar, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import Image from 'next/image';

// Types
interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  pros: string | null;
  cons: string | null;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function ReviewsSection({
  reviews,
  averageRating,
  totalReviews
}: ReviewsSectionProps) {
  const [showMoreReviews, setShowMoreReviews] = useState(false);
  
  // Display only 3 reviews initially, unless showMoreReviews is true
  const displayReviews = showMoreReviews ? reviews : reviews.slice(0, 3);
  
  // Generate rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <FiStar
            key={index}
            className={`w-4 h-4 ${
              index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>User Reviews</h2>
      
      {/* Rating summary */}
      <div className="p-4 mt-4 bg-white border rounded-lg">
        <div className="flex flex-col items-center sm:flex-row">
          <div className="flex flex-col items-center mb-4 sm:mb-0 sm:mr-8">
            <div className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
              <span className="text-xl text-gray-500">/5</span>
            </div>
            <div className="my-2">
              {renderRatingStars(averageRating)}
            </div>
            <p className="text-sm text-gray-500">Based on {totalReviews} reviews</p>
          </div>
          
          <div className="flex-1">
            {/* Rating breakdown */}
            {[5, 4, 3, 2, 1].map((star) => {
              // Calculate percentage of reviews for each star rating
              const reviewsWithRating = reviews.filter(review => Math.round(review.rating) === star).length;
              const percentage = totalReviews > 0 ? (reviewsWithRating / totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center mb-1">
                  <div className="flex items-center mr-2">
                    <span className="mr-1 text-sm">{star}</span>
                    <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-yellow-400 rounded"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">{reviewsWithRating}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Write review button */}
        <div className="mt-4 text-center sm:text-right">
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600">
            Write a Review
          </button>
        </div>
      </div>
      
      {/* Review listing */}
      {reviews.length > 0 ? (
        <>
          <div className="mt-6 space-y-4">
            {displayReviews.map((review) => (
              <div key={review.id} className="p-4 bg-white border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 mr-3 overflow-hidden bg-gray-200 rounded-full">
                      {review.user.image ? (
                        <Image 
                          src={review.user.image} 
                          alt={review.user.name} 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-500">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{review.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {renderRatingStars(review.rating)}
                    <p className="mt-1 text-xs font-medium text-gray-700">
                      {review.rating.toFixed(1)}/5
                    </p>
                  </div>
                </div>
                
                <h3 className="mt-3 text-lg font-semibold">{review.title}</h3>
                <p className="mt-1 text-gray-700">{review.content}</p>
                
                {(review.pros || review.cons) && (
                  <div className="grid grid-cols-1 gap-4 mt-3 md:grid-cols-2">
                    {review.pros && (
                      <div className="p-3 bg-green-50 rounded-md">
                        <div className="flex items-center mb-2">
                          <FiThumbsUp className="mr-2 text-green-500" />
                          <h4 className="font-medium text-green-700">Pros</h4>
                        </div>
                        <p className="text-sm text-green-800">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="p-3 bg-red-50 rounded-md">
                        <div className="flex items-center mb-2">
                          <FiThumbsDown className="mr-2 text-red-500" />
                          <h4 className="font-medium text-red-700">Cons</h4>
                        </div>
                        <p className="text-sm text-red-800">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end mt-3">
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <FiThumbsUp className="mr-1" /> Helpful
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show more/less reviews button */}
          {reviews.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowMoreReviews(!showMoreReviews)}
                className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary-50"
              >
                {showMoreReviews ? 'Show Less Reviews' : `Show All ${reviews.length} Reviews`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 mt-4 text-center bg-white border rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review this bike!</p>
          <button className="px-4 py-2 mt-3 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600">
            Write a Review
          </button>
        </div>
      )}
    </div>
  );
}