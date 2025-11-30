'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiClock, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiEdit3,
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiSettings
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

export default function ActivityPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<BikeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

  // Show loading state while checking authentication
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Activity</h1>
                <p className="text-gray-600">Track your bike selling submissions</p>
              </div>
            </div>
            <Link
              href="/sell-bike"
              className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
            >
              Sell Another Bike
            </Link>
          </div>

          {/* Content */}
          {submissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-12 text-center">
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
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {submissions.map((submission) => {
                const bike = submission.used_bikes;
                return (
                  <div key={submission.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Bike Image */}
                    <div className="relative h-48 bg-gray-200">
                      {bike.photos && bike.photos.length > 0 ? (
                        <Image
                          src={bike.photos[0]}
                          alt={`${bike.brand} ${bike.model}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <FiEye className="w-12 h-12" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bike.status)}`}>
                          <div className="flex items-center">
                            {getStatusIcon(bike.status)}
                            <span className="ml-2">{getStatusText(bike.status)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bike Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {bike.brand} {bike.model}
                            {bike.variant && ` ${bike.variant}`}
                          </h3>
                          <p className="text-gray-600">{bike.year} • {bike.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">
                            {formatPrice(bike.expected_price)}
                          </p>
                          <p className="text-sm text-gray-500">{bike.condition} condition</p>
                        </div>
                      </div>

                      {/* Key Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
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
                      <div className="border-t pt-4">
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
                            {bike.status === 'sold' && bike.sold_at && (
                              <p className="text-blue-600">
                                Sold on {formatDate(bike.sold_at)}
                              </p>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {bike.status === 'approved' && (
                              <Link
                                href={`/used-bikes/${bike.id}`}
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}