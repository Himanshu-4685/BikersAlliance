'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiStar, FiSave, FiArrowLeft, FiTrash2 } from 'react-icons/fi';

interface Review {
  review_id: number;
  variant_id: number;
  user_id: number;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  user_name: string;
  user_email: string;
  variant_name: string;
  model_name: string;
  brand_name: string;
}

export default function EditReviewPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;
  
  const [review, setReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review_body: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin && reviewId) {
      fetchReview();
    }
  }, [admin, reviewId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReview(data.review);
          setFormData({
            rating: data.review.rating,
            title: data.review.title || '',
            review_body: data.review.body || ''
          });
        } else {
          setError('Review not found');
        }
      } else {
        setError('Failed to load review');
      }
    } catch (error) {
      console.error('Error fetching review:', error);
      setError('Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          rating: formData.rating,
          title: formData.title.trim() || 'Review',
          review_body: formData.review_body.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Review updated successfully!');
        fetchReview(); // Refresh data
      } else {
        setError(data.error || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/reviews');
      } else {
        setError(data.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  if (isLoading || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!admin || !review) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Edit Review" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Review</h1>
                <p className="text-gray-600">
                  Review by {review.user_name} for {review.brand_name} {review.model_name} - {review.variant_name}
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/reviews')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Reviews
              </button>
            </div>

            {/* Review Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Reviewer:</span>
                  <p className="text-gray-900">{review.user_name}</p>
                  <p className="text-gray-600">{review.user_email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Bike:</span>
                  <p className="text-gray-900">{review.brand_name} {review.model_name}</p>
                  <p className="text-gray-600">{review.variant_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">
                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    Review Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="review_body"
                    value={formData.review_body}
                    onChange={(e) => setFormData({ ...formData, review_body: e.target.value })}
                    placeholder="Write your detailed review..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                    maxLength={1000}
                    required
                  />
                  <div className="mt-1 text-sm text-gray-500 text-right">
                    {formData.review_body.length}/1000 characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4 mr-2" />
                        Delete Review
                      </>
                    )}
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => router.push('/admin/reviews')}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || formData.rating === 0 || !formData.review_body.trim()}
                      className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4 mr-2" />
                          Update Review
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}