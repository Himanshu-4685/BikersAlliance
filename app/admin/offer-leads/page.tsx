'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  FiUsers, 
  FiEdit2, 
  FiTrash2, 
  FiPhone, 
  FiMail,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiEye
} from 'react-icons/fi';

interface OfferLead {
  id: string;
  name: string;
  email: string;
  mobile: string;
  bike_name: string;
  dealer_name: string;
  offer_title: string;
  offer_price: number;
  original_price: number;
  discount_percent: number;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  notes: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

export default function AdminOfferLeadsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<OfferLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLead, setEditingLead] = useState<OfferLead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      const response = await fetch(`/api/admin/bike-offer-leads?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setLeads(result.data.leads || []);
      } else {
        setError(result.message || 'Failed to fetch leads');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/bike-offer-leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: leadId,
          status: newStatus,
          notes: notes
        })
      });

      const result = await response.json();
      if (result.success) {
        fetchLeads();
        setShowEditModal(false);
        setEditingLead(null);
      } else {
        alert('Failed to update lead');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bike-offer-leads?id=${leadId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        fetchLeads();
      } else {
        alert('Failed to delete lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete lead');
    }
  };

  const exportLeads = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Mobile,Bike,Offer,Price,Status,Date\\n"
      + leads.map(lead => 
          `${lead.name},${lead.email},${lead.mobile},${lead.bike_name},${lead.offer_title},${lead.offer_price},${lead.status},${new Date(lead.created_at).toLocaleDateString()}`
        ).join("\\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bike_offer_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const filteredLeads = leads.filter(lead => {
    if (searchQuery) {
      return lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             lead.mobile.includes(searchQuery) ||
             lead.bike_name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Offer Leads Management" />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Offer Leads Management</h1>
                <p className="text-gray-600 mt-1">Track and manage customer inquiries for bike offers</p>
              </div>
              <button
                onClick={exportLeads}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <FiDownload className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiEye className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Leads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.status === 'new').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiPhone className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.status === 'qualified').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => {
                      const leadDate = new Date(lead.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return leadDate >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFilter className="inline mr-2" />
                  Status Filter
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Leads
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, mobile, or bike..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Offer Leads ({filteredLeads.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading leads...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchLeads}
                  className="mt-2 bg-primary text-white px-4 py-2 rounded-md"
                >
                  Retry
                </button>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">
                  {searchQuery || selectedStatus !== 'all' 
                    ? 'No leads match your filters' 
                    : 'No leads found yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offer Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.bike_name}</div>
                            <div className="text-xs text-gray-400">{lead.dealer_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.offer_title}</div>
                            <div className="text-sm text-gray-500">
                              {formatPrice(lead.offer_price)} 
                              {lead.discount_percent && (
                                <span className="text-green-600 ml-1">({lead.discount_percent}% OFF)</span>
                              )}
                            </div>
                            {lead.original_price && (
                              <div className="text-xs text-gray-400 line-through">
                                {formatPrice(lead.original_price)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center text-sm text-gray-900">
                              <FiMail className="mr-2 w-4 h-4" />
                              <a href={`mailto:${lead.email}`} className="hover:text-primary">
                                {lead.email}
                              </a>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FiPhone className="mr-2 w-4 h-4" />
                              <a href={`tel:${lead.mobile}`} className="hover:text-primary">
                                {lead.mobile}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[lead.status]
                          }`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                          <div className="text-xs text-gray-400">
                            {new Date(lead.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingLead(lead);
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit lead"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete lead"
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
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Lead Status
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({...editingLead, status: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({...editingLead, notes: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add notes about this lead..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLead(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateLeadStatus(editingLead.id, editingLead.status, editingLead.notes)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}