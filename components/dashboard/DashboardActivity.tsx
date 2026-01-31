'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiClock, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiSettings,
  FiBookmark,
  FiTrash2,
  FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';

interface UsedBike {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  category: string;
  fuel_type: string;
  transmission: string;
  km_driven: number;
  ownership: string;
  expected_price: number;
  condition: string;
  description?: string;
  city: string;
  state: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  admin_notes?: string;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  sold_at?: string;
}

interface BikeSubmission {
  id: string;
  submission_status: 'active' | 'cancelled' | 'withdrawn';
  notes?: string;
  created_at: string;
  updated_at: string;
  used_bikes: UsedBike;
}

interface SavedComparison {
  comparison_id: string;
  comparison_name: string;
  created_at: string;
  variants: {
    variant_id: string;
    variant_name: string;
    on_road_price: number;
    models: {
      model_name: string;
      brands: {
        brand_name: string;
        logo_url: string;
      };
    };
  }[];
  variantCount: number;
}

export default function DashboardActivity() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<BikeSubmission[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'comparisons'>('submissions');
  const [loading, setLoading] = useState(true);
  const [comparisonsLoading, setComparisonsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch user submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('/api/user-bike-submissions');
        const result = await response.json();

        if (result.success) {
          setSubmissions(result.data);
        } else {
          setError(result.error || 'Failed to fetch submissions');
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load your bike submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  // Fetch saved comparisons
  const fetchSavedComparisons = async () => {
    if (!user) return;

    try {
      setComparisonsLoading(true);
      const response = await fetch(`/api/comparisons?userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setSavedComparisons(result.data.comparisons || []);
      } else {
        console.error('Failed to fetch saved comparisons:', result.error);
      }
    } catch (err) {
      console.error('Error fetching saved comparisons:', err);
    } finally {
      setComparisonsLoading(false);
    }
  };

  // Fetch saved comparisons when switching to comparisons tab
  useEffect(() => {
    if (activeTab === 'comparisons' && user) {
      fetchSavedComparisons();
    }
  }, [activeTab, user]);

  // Delete saved comparison
  const deleteSavedComparison = async (comparisonId: string) => {
    if (!user) return;

    try {
      setDeleteLoading(comparisonId);
      const response = await fetch(`/api/comparisons?id=${comparisonId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSavedComparisons(prev => prev.filter(comp => comp.comparison_id !== comparisonId));
      } else {
        alert('Failed to delete comparison: ' + result.error);
      }
    } catch (err) {
      console.error('Error deleting comparison:', err);
      alert('Failed to delete comparison');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <FiX className="w-5 h-5 text-red-500" />;
      case 'sold':
        return <FiDollarSign className="w-5 h-5 text-blue-500" />;
      case 'pending':
      default:
        return <FiClock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved & Listed';
      case 'rejected':
        return 'Rejected';
      case 'sold':
        return 'Sold';
      case 'pending':
      default:
        return 'Under Review';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const handleWithdrawSubmission = async (submissionId: string) => {
    try {
      const response = await fetch('/api/user-bike-submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          submission_status: 'withdrawn'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update the submission in the local state
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, submission_status: 'withdrawn' }
            : sub
        ));
      } else {
        alert('Failed to withdraw submission: ' + result.error);
      }
    } catch (err) {
      console.error('Error withdrawing submission:', err);
      alert('Failed to withdraw submission');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Activity</h2>
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <FiX className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Activity</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Activity</h2>
            <p className="text-gray-600 mt-1">Track your bike submissions and saved comparisons</p>
          </div>
          <Link
            href="/sell-bike"
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium text-sm"
          >
            Sell Another Bike
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiSettings className="w-4 h-4 mr-2" />
                Bike Submissions ({submissions.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('comparisons')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'comparisons'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiBarChart2 className="w-4 h-4 mr-2" />
                Saved Comparisons ({savedComparisons.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'submissions' ? renderSubmissions() : renderSavedComparisons()}
      </div>
    </div>
  );

  function renderSubmissions() {
    if (submissions.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiSettings className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Activity Yet</h2>
          <p className="text-gray-600 mb-8">
            You haven't submitted any bikes for sale yet. Start by listing your bike!
          </p>
          <Link
            href="/sell-bike"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
          >
            Sell Your Bike
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {submissions.map((submission) => {
          const bike = submission.used_bikes;
          return (
            <div key={submission.id} className="border rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Bike Image */}
                <div className="flex-shrink-0 w-full md:w-32">
                  <div className="relative h-24 md:h-24 bg-gray-200 rounded-lg overflow-hidden">
                    {bike.photos && bike.photos.length > 0 ? (
                      <Image
                        src={bike.photos[0]}
                        alt={`${bike.brand} ${bike.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <FiEye className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bike Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {bike.brand} {bike.model}
                        {bike.variant && ` ${bike.variant}`}
                      </h3>
                      <p className="text-gray-600">{bike.year} • {bike.category}</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bike.status)}`}>
                      <div className="flex items-center">
                        {getStatusIcon(bike.status)}
                        <span className="ml-2">{getStatusText(bike.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xl font-bold text-red-600">
                      {formatPrice(bike.expected_price)}
                    </p>
                    <p className="text-sm text-gray-500">{bike.condition} condition</p>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      {bike.city}, {bike.state}
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      {bike.km_driven.toLocaleString()} km
                    </div>
                  </div>

                  {/* Submission Info */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-600">
                          Submitted on {formatDate(submission.created_at)}
                        </p>
                        {bike.status === 'approved' && bike.approved_at && (
                          <p className="text-green-600">
                            Approved on {formatDate(bike.approved_at)}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {bike.status === 'approved' && (
                          <Link
                            href={`/used-bikes/details/${bike.id}`}
                            className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                        )}
                        
                        {submission.submission_status === 'active' && bike.status === 'pending' && (
                          <button
                            onClick={() => handleWithdrawSubmission(submission.id)}
                            className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                            title="Withdraw submission"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {bike.admin_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <p className="font-medium text-gray-700">Admin Note:</p>
                        <p className="text-gray-600">{bike.admin_notes}</p>
                      </div>
                    )}

                    {/* User Notes */}
                    {submission.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                        <p className="font-medium text-blue-700">Your Note:</p>
                        <p className="text-blue-600">{submission.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderSavedComparisons() {
    if (comparisonsLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      );
    }

    if (savedComparisons.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiBarChart2 className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Comparisons</h2>
          <p className="text-gray-600 mb-8">
            You haven't saved any bike comparisons yet. Compare bikes and save your favorites!
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
          >
            <FiBarChart2 className="w-5 h-5 mr-2" />
            Compare Bikes
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {savedComparisons.map((comparison) => (
          <div key={comparison.comparison_id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{comparison.comparison_name}</h3>
                <p className="text-sm text-gray-600">
                  Saved on {formatDate(comparison.created_at)} • {comparison.variantCount} bikes compared
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/compare?variants=${comparison.variants.map(v => v.variant_id).join(',')}`}
                  className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium"
                >
                  <FiBarChart2 className="w-4 h-4 inline mr-1" />
                  View
                </Link>
                <button
                  onClick={() => deleteSavedComparison(comparison.comparison_id)}
                  disabled={deleteLoading === comparison.comparison_id}
                  className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
                >
                  {deleteLoading === comparison.comparison_id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiTrash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Show variant previews */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {comparison.variants.map((variant, index) => (
                <div key={variant.variant_id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {variant.models.brands.brand_name} {variant.models.model_name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">{variant.variant_name}</p>
                    <p className="text-sm font-bold text-blue-600">
                      ₹{variant.on_road_price ? variant.on_road_price.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}