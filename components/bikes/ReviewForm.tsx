'use client';

import { useState } from 'react';
import { FiStar, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';

interface ReviewFormProps {
  variantId: number;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ 
  variantId, 
  onReviewSubmitted, 
  onCancel 
}: ReviewFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review_body: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to write a review');
      return;
    }

    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!formData.review_body.trim()) {
      setError('Please write a review');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variant_id: variantId,
          rating: formData.rating,
          title: formData.title.trim() || 'User Review',
          review_body: formData.review_body.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          rating: 0,
          title: '',
          review_body: ''
        });
        
        // Call success callback
        onReviewSubmitted?.();
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <FiUser className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Login Required</h3>
        <p className="text-yellow-700 mb-4">
          You need to be logged in to write a review.
        </p>
        <a 
          href="/login" 
          className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
          Login to Continue
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center mb-4">
        <FiMessageSquare className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
              >
                <FiStar
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= formData.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {formData.rating > 0 && `${formData.rating} out of 5 stars`}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Give your review a title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            maxLength={100}
          />
        </div>

        {/* Review Content */}
        <div>
          <label htmlFor="review_body" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review_body"
            value={formData.review_body}
            onChange={(e) => setFormData({ ...formData, review_body: e.target.value })}
            placeholder="Share your experience with this bike..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            maxLength={1000}
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {formData.review_body.length}/1000 characters
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0 || !formData.review_body.trim()}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          By submitting this review, you agree that it reflects your honest opinion and experience with this bike.
        </p>
      </div>
    </div>
  );
}