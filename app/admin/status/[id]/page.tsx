'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiArrowLeft, FiEdit, FiCalendar, FiDollarSign, FiTag } from 'react-icons/fi';

interface Status {
  status_id: number;
  model_id: number;
  variant_id: number;
  status_type: 'upcoming' | 'new_launch';
  launch_date?: string;
  expected_launch?: string;
  price_range?: string;
  created_at: string;
  model_name?: string;
  brand_name?: string;
  variant_name?: string;
}

export default function ViewStatusPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const statusId = params.id as string;
  
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin && statusId) {
      fetchStatus();
    }
  }, [admin, statusId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/status/${statusId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      } else {
        console.error('Failed to fetch status');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statusType: string) => {
    const statusStyles = {
      new_launch: 'bg-green-100 text-green-800 border-green-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[statusType as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {statusType === 'new_launch' ? 'New Launch' : 'Upcoming'}
      </span>
    );
  };

  if (isLoading || !admin || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader title="Status Not Found" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Status Not Found</h1>
                <p className="text-gray-600 mb-6">The status record you're looking for doesn't exist.</p>
                <button
                  onClick={() => router.push('/admin/status')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Status
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="View Status" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/status')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-4"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Status
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {status.brand_name} {status.model_name}
                  </h1>
                  <p className="text-gray-600">Status Details</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/status/${statusId}/edit`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiEdit className="w-4 h-4 mr-2" />
                Edit Status
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Status Information</h2>
                  {getStatusBadge(status.status_type)}
                </div>
              </div>
              
              <div className="p-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiTag className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Status ID</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{status.status_id}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiTag className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Model ID</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{status.model_id}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiTag className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Variant ID</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{status.variant_id}</p>
                  </div>
                </div>

                {/* Model Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Model Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <p className="text-gray-900">{status.brand_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <p className="text-gray-900">{status.model_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                      <p className="text-gray-900">{status.variant_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Launch Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Launch Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status Type</label>
                      <div className="flex items-center">
                        <FiTag className="w-4 h-4 text-gray-400 mr-2" />
                        {getStatusBadge(status.status_type)}
                      </div>
                    </div>
                    
                    {status.status_type === 'new_launch' && status.launch_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Launch Date</label>
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">
                            {new Date(status.launch_date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {status.status_type === 'upcoming' && status.expected_launch && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Launch</label>
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">
                            {new Date(status.expected_launch).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Information */}
                {status.price_range && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Pricing</h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <FiDollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Price Range</label>
                          <p className="text-xl font-semibold text-green-900">{status.price_range}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Record Information</h3>
                  <div className="text-sm text-gray-600">
                    <p>Created: {new Date(status.created_at).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}