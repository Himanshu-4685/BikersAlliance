'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiEye, FiCheck, FiX, FiTrash2, FiSearch, FiFilter, FiEdit, FiStar, FiPhone, FiMail, FiMapPin, FiPlus } from 'react-icons/fi';
import Image from 'next/image';

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
  owner_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  has_rc: boolean;
  has_insurance: boolean;
  has_puc: boolean;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  admin_notes?: string;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function UsedBikesAdmin() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [bikes, setBikes] = useState<UsedBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState<UsedBike | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCounts, setStatusCounts] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBikes, setTotalBikes] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (currentPage * limit).toString(),
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/used-bikes?${params}`);
      const result = await response.json();

      if (result.success) {
        setBikes(result.data);
        setTotalBikes(result.pagination.total);
        setStatusCounts(result.statusCounts);
      } else {
        console.error('Failed to fetch bikes:', result.error);
      }
    } catch (error) {
      console.error('Error fetching bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, [currentPage, statusFilter, searchTerm]);

  const updateBikeStatus = async (bikeId: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/used-bikes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bikeId,
          status,
          admin_notes: adminNotes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        fetchBikes();
        setShowModal(false);
        setSelectedBike(null);
      } else {
        alert('Failed to update bike status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating bike:', error);
      alert('Failed to update bike status');
    }
  };

  const toggleFeatured = async (bikeId: string, featured: boolean) => {
    try {
      const response = await fetch('/api/admin/used-bikes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bikeId,
          featured: !featured
        })
      });

      const result = await response.json();
      
      if (result.success) {
        fetchBikes();
      } else {
        alert('Failed to update featured status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const deleteBike = async (bikeId: string) => {
    if (!confirm('Are you sure you want to delete this bike listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/used-bikes?id=${bikeId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        fetchBikes();
        setShowModal(false);
        setSelectedBike(null);
      } else {
        alert('Failed to delete bike: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting bike:', error);
      alert('Failed to delete bike');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Used Bikes Management" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Used Bikes Management</h1>
                  <p className="text-gray-600">Manage bike listings submitted through the sell-bike form</p>
                </div>
                <button
                  onClick={() => router.push('/admin/used-bikes/new')}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Listing
                </button>
              </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Listings</h3>
          <p className="text-2xl font-bold text-gray-900">{totalBikes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">{statusCounts.approved || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Sold</h3>
          <p className="text-2xl font-bold text-blue-600">{statusCounts.sold || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by brand, model, owner name, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bikes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading bikes...</p>
          </div>
        ) : bikes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No bikes found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bikes.map((bike) => (
                    <tr key={bike.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {bike.photos.length > 0 && (
                            <div className="flex-shrink-0 h-12 w-12 mr-4">
                              <Image
                                src={bike.photos[0]}
                                alt={`${bike.brand} ${bike.model}`}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {bike.brand} {bike.model}
                              </p>
                              {bike.featured && (
                                <FiStar className="w-4 h-4 text-yellow-500 ml-2" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {bike.year} • {bike.km_driven.toLocaleString()} km • {bike.fuel_type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bike.owner_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bike.city}, {bike.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(bike.expected_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bike.status)}`}>
                          {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bike.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBike(bike);
                              setShowModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/used-bikes/edit/${bike.id}`)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Listing"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleFeatured(bike.id, bike.featured)}
                            className={`${bike.featured ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-500`}
                            title="Toggle Featured"
                          >
                            <FiStar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBike(bike.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={(currentPage + 1) * limit >= totalBikes}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{currentPage * limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((currentPage + 1) * limit, totalBikes)}
                    </span>{' '}
                    of <span className="font-medium">{totalBikes}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={(currentPage + 1) * limit >= totalBikes}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for bike details */}
      {showModal && selectedBike && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedBike.brand} {selectedBike.model} - Listing Details
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bike Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Bike Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand:</span>
                          <span className="font-medium">{selectedBike.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium">{selectedBike.model}</span>
                        </div>
                        {selectedBike.variant && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Variant:</span>
                            <span className="font-medium">{selectedBike.variant}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Year:</span>
                          <span className="font-medium">{selectedBike.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedBike.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fuel Type:</span>
                          <span className="font-medium">{selectedBike.fuel_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transmission:</span>
                          <span className="font-medium">{selectedBike.transmission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">KM Driven:</span>
                          <span className="font-medium">{selectedBike.km_driven.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ownership:</span>
                          <span className="font-medium">{selectedBike.ownership}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Condition:</span>
                          <span className="font-medium">{selectedBike.condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Price:</span>
                          <span className="font-medium text-green-600">{formatPrice(selectedBike.expected_price)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents Available</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Registration Certificate (RC):</span>
                          <span className={`text-sm px-2 py-1 rounded ${selectedBike.has_rc ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedBike.has_rc ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Insurance:</span>
                          <span className={`text-sm px-2 py-1 rounded ${selectedBike.has_insurance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedBike.has_insurance ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">PUC Certificate:</span>
                          <span className={`text-sm px-2 py-1 rounded ${selectedBike.has_puc ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedBike.has_puc ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedBike.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{selectedBike.description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Owner Details & Photos */}
                  <div className="space-y-4">
                    {/* Owner Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Owner Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center">
                          <span className="text-gray-600 w-20">Name:</span>
                          <span className="font-medium">{selectedBike.owner_name}</span>
                        </div>
                        <div className="flex items-center">
                          <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`mailto:${selectedBike.email}`} className="text-blue-600 hover:underline">
                            {selectedBike.email}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`tel:${selectedBike.phone}`} className="text-blue-600 hover:underline">
                            {selectedBike.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <FiMapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedBike.city}, {selectedBike.state}</span>
                        </div>
                      </div>
                    </div>

                    {/* Photos */}
                    {selectedBike.photos.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Photos ({selectedBike.photos.length})</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBike.photos.slice(0, 6).map((photo, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                              <Image
                                src={photo}
                                alt={`Bike photo ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {selectedBike.photos.length > 6 && (
                            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">+{selectedBike.photos.length - 6} more</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                      <textarea
                        rows={3}
                        placeholder="Add notes about this listing..."
                        defaultValue={selectedBike.admin_notes || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        id="admin-notes"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <div className="flex space-x-2">
                  {selectedBike.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                          updateBikeStatus(selectedBike.id, 'approved', notes);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <FiCheck className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                          updateBikeStatus(selectedBike.id, 'rejected', notes);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <FiX className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {selectedBike.status === 'approved' && (
                    <button
                      onClick={() => {
                        const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                        updateBikeStatus(selectedBike.id, 'sold', notes);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Mark as Sold
                    </button>
                  )}

                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}