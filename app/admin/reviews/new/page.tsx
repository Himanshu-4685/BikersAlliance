'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiStar, FiSave, FiArrowLeft } from 'react-icons/fi';

interface Variant {
  variant_id: number;
  variant_name: string;
  model_name?: string;
  brand_name?: string;
}

export default function NewReviewPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    variant_id: '',
    rating: 0,
    title: '',
    review_body: ''
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchVariants();
    }
  }, [admin]);

  const fetchVariants = async () => {
    try {
      const response = await fetch('/api/admin/variants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVariants(data.variants || []);
      } else {
        console.error('Failed to fetch variants');
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.variant_id) {
      setError('Please select a bike variant');
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
    setSuccess('');

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          variant_id: parseInt(formData.variant_id),
          rating: formData.rating,
          title: formData.title.trim() || 'Admin Review',
          review_body: formData.review_body.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Review created successfully!');
        setFormData({
          variant_id: '',
          rating: 0,
          title: '',
          review_body: ''
        });
      } else {
        setError(data.error || 'Failed to create review');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      setError('Failed to create review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Create New Review" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Review</h1>
                <p className="text-gray-600">Add a new review as admin</p>
              </div>
              <button
                onClick={() => router.push('/admin/reviews')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Reviews
              </button>
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
                {/* Variant Selection */}
                <div>
                  <label htmlFor="variant_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Bike Variant <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="variant_id"
                    value={formData.variant_id}
                    onChange={(e) => setFormData({ ...formData, variant_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select a bike variant...</option>
                    {variants.map((variant) => (
                      <option key={variant.variant_id} value={variant.variant_id}>
                        {variant.brand_name} {variant.model_name} - {variant.variant_name}
                      </option>
                    ))}
                  </select>
                </div>

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

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4 mr-2" />
                        Create Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}