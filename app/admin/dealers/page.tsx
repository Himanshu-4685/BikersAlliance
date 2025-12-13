'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiMapPin, 
  FiPhone, 
  FiMail,
  FiLoader,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

// Types
interface Dealer {
  dealer_id: number;
  name: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

interface DealerFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
}

const emptyFormData: DealerFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: ''
};

export default function DealersManagement() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [formData, setFormData] = useState<DealerFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  // Check authentication
  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  // Fetch dealers
  const fetchDealers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (cityFilter) params.append('city', cityFilter);
      if (stateFilter) params.append('state', stateFilter);

      const response = await fetch(`/api/dealers?${params}`);
      const result = await response.json();

      if (result.success) {
        setDealers(result.data.dealers);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.totalCount);
      } else {
        console.error('Failed to fetch dealers:', result.error);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search dealers
  const searchDealers = async () => {
    if (!searchQuery.trim()) {
      fetchDealers();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/dealers/search?q=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();

      if (result.success) {
        setDealers(result.data);
        setTotalCount(result.count);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        console.error('Failed to search dealers:', result.error);
      }
    } catch (error) {
      console.error('Error searching dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingDealer ? `/api/dealers/${editingDealer.dealer_id}` : '/api/dealers';
      const method = editingDealer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingDealer(null);
        setFormData(emptyFormData);
        fetchDealers(currentPage);
        alert(editingDealer ? 'Dealer updated successfully!' : 'Dealer created successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving dealer:', error);
      alert('Failed to save dealer');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (dealer: Dealer) => {
    if (!confirm(`Are you sure you want to delete ${dealer.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/dealers/${dealer.dealer_id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchDealers(currentPage);
        alert('Dealer deleted successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting dealer:', error);
      alert('Failed to delete dealer');
    }
  };

  // Handle edit
  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setFormData({
      name: dealer.name,
      address: dealer.address || '',
      city: dealer.city,
      state: dealer.state,
      pincode: dealer.pincode || '',
      phone: dealer.phone || '',
      email: dealer.email || ''
    });
    setShowForm(true);
  };

  // Handle new dealer
  const handleNew = () => {
    setEditingDealer(null);
    setFormData(emptyFormData);
    setShowForm(true);
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  useEffect(() => {
    fetchDealers(1);
  }, [cityFilter, stateFilter]);

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
        <AdminHeader title="Dealers Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dealers Management</h1>
                <p className="text-gray-600 mt-1">Manage authorized dealers across different locations</p>
              </div>
              <button
                onClick={handleNew}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Dealer</span>
              </button>
            </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search dealers by name, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchDealers()}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter by city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter by state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={searchDealers}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              setCityFilter('');
              setStateFilter('');
              fetchDealers(1);
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Dealers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Dealers ({totalCount})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <FiLoader className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading dealers...</p>
          </div>
        ) : dealers.length === 0 ? (
          <div className="p-8 text-center">
            <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Dealers Found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first dealer.</p>
            <button
              onClick={handleNew}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600"
            >
              Add First Dealer
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dealers.map((dealer) => (
                    <tr key={dealer.dealer_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {dealer.name}
                          </div>
                          {dealer.address && (
                            <div className="text-sm text-gray-500">
                              {dealer.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiMapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{dealer.city}</div>
                            <div className="text-sm text-gray-500">
                              {dealer.state} {dealer.pincode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {dealer.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FiPhone className="w-3 h-3 mr-1" />
                              {dealer.phone}
                            </div>
                          )}
                          {dealer.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FiMail className="w-3 h-3 mr-1" />
                              {dealer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dealer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(dealer)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dealer)}
                            className="text-red-600 hover:text-red-900"
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
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} dealers
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchDealers(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchDealers(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dealer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingDealer ? 'Edit Dealer' : 'Add New Dealer'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dealer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter dealer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter PIN code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingDealer(null);
                      setFormData(emptyFormData);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting && <FiLoader className="w-4 h-4 animate-spin" />}
                    <span>{editingDealer ? 'Update' : 'Create'} Dealer</span>
                  </button>
                </div>
              </form>
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