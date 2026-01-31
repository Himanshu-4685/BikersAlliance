'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiEdit, FiMail } from 'react-icons/fi';

interface BikeSubmission {
  id: number;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  expected_price: number;
  owner_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  condition: string;
  description?: string;
}

export default function SellBikeAdmin() {
  const [submissions, setSubmissions] = useState<BikeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<BikeSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/sell-bike-status'
        : `/api/sell-bike-status?status=${statusFilter}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setSubmissions(result.data);
      } else {
        console.error('Failed to fetch submissions:', result.error);
        alert('Failed to fetch submissions: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Network error while fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bikeId: number, newStatus: 'approved' | 'rejected') => {
    try {
      setUpdating(bikeId);
      
      const response = await fetch('/api/sell-bike-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bikeId,
          newStatus,
          adminNotes: adminNotes.trim() || undefined
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        await fetchSubmissions();
        // Reset form
        setAdminNotes('');
        setShowModal(false);
        setSelectedSubmission(null);
        alert(`Bike listing ${newStatus} successfully! Email notification sent to owner.`);
      } else {
        alert('Failed to update status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error while updating status');
    } finally {
      setUpdating(null);
    }
  };

  const openModal = (submission: BikeSubmission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission);
    setModalAction(action);
    setShowModal(true);
    setAdminNotes('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sell Bike Submissions</h1>
        <p className="text-gray-600">Manage and review bike listings submitted by users</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button 
            onClick={fetchSubmissions}
            className="bg-blue-500 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      )}

      {/* Submissions List */}
      {!loading && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No submissions found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => {
                    const bikeName = `${submission.brand} ${submission.model}${submission.variant ? ` ${submission.variant}` : ''} (${submission.year})`;
                    
                    return (
                      <tr key={submission.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{bikeName}</div>
                            <div className="text-sm text-gray-500">{submission.condition}</div>
                            {submission.description && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                {submission.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{submission.owner_name}</div>
                            <div className="text-sm text-gray-500">{submission.email}</div>
                            <div className="text-sm text-gray-500">{submission.phone}</div>
                            <div className="text-xs text-gray-400">{submission.city}, {submission.state}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {formatPrice(submission.expected_price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(submission.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {submission.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => openModal(submission, 'approve')}
                                  disabled={updating === submission.id}
                                  className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                                  title="Approve"
                                >
                                  <FiCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openModal(submission, 'reject')}
                                  disabled={updating === submission.id}
                                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <a 
                              href={`mailto:${submission.email}`}
                              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                              title="Email Owner"
                            >
                              <FiMail className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {modalAction === 'approve' ? 'Approve' : 'Reject'} Bike Listing
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Bike:</strong> {selectedSubmission.brand} {selectedSubmission.model} ({selectedSubmission.year})
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Owner:</strong> {selectedSubmission.owner_name} ({selectedSubmission.email})
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Recommended)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder={modalAction === 'approve' 
                    ? 'e.g., Great listing! All details look good.' 
                    : 'e.g., Photos are not clear enough. Please upload better images.'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleStatusChange(selectedSubmission.id, modalAction === 'approve' ? 'approved' : 'rejected')}
                  disabled={updating === selectedSubmission.id}
                  className={`flex-1 py-2 px-4 rounded-md font-medium ${
                    modalAction === 'approve' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } disabled:opacity-50`}
                >
                  {updating === selectedSubmission.id ? 'Processing...' : `${modalAction === 'approve' ? 'Approve' : 'Reject'} & Send Email`}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedSubmission(null);
                    setAdminNotes('');
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}