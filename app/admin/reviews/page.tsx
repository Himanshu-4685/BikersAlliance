'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiEdit, FiTrash2, FiEye, FiStar } from 'react-icons/fi';

interface Review {
  review_id: number;
  variant_id?: number;
  user_id?: number;
  rating: number;
  title?: string;
  body?: string;
  created_at: string;
  user_name?: string;
  variant_name?: string;
  model_name?: string;
  brand_name?: string;
}

export default function AdminReviewsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchReviews();
    }
  }, [admin, currentPage, searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setReviews(reviews.filter(review => review.review_id !== reviewId));
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Review Title',
      render: (review: Review) => review.title || 'No title'
    },
    {
      key: 'user_name',
      label: 'User',
      render: (review: Review) => review.user_name || 'Anonymous'
    },
    {
      key: 'variant_name',
      label: 'Variant',
      render: (review: Review) => {
        if (review.variant_name) {
          return `${review.brand_name || ''} ${review.model_name || ''} ${review.variant_name}`.trim();
        }
        return '-';
      }
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (review: Review) => renderStars(review.rating)
    },
    {
      key: 'body',
      label: 'Review',
      render: (review: Review) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {review.body || 'No review text'}
          </p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (review: Review) => new Date(review.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/reviews/${review.review_id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/reviews/${review.review_id}/edit`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(review.review_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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
        <AdminHeader title="Reviews Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
                <p className="text-gray-600">Manage user reviews and ratings</p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={reviews}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}