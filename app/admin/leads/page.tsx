'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiEye,
  FiEdit3,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiUser,
  FiRefreshCw,
  FiCheck,
  FiX
} from 'react-icons/fi';
// Simple date formatting helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  variant_id: number;
  bike_name: string;
  variant_name: string;
  brand_name: string;
  lead_type: 'get_on_road_price' | 'book_test_ride';
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  created_at: string;
  updated_at: string;
}

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, updates: any) => void;
  admins: Admin[];
}

// Lead Details Modal Component
function LeadDetailsModal({ lead, isOpen, onClose, onUpdate, admins }: LeadDetailsModalProps) {
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setAssignedTo('');
      setAdminNotes('');
    }
  }, [lead]);

  const handleUpdate = async () => {
    if (!lead) return;

    setIsUpdating(true);
    try {
      await onUpdate(lead.id, {
        status
      });
      onClose();
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get available status options based on lead type (using original status values)
  const getStatusOptions = (leadType: string) => {
    return [
      { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
      { value: 'contacted', label: 'Contacted', color: 'bg-orange-100 text-orange-800' },
      { value: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-800' }
    ];
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Lead Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                    {lead.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                    {lead.phone}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                    {lead.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lead.lead_type === 'get_on_road_price' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {lead.lead_type === 'get_on_road_price' ? 'Get On-Road Price' : 'Book Test Ride'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="flex items-start text-sm text-gray-900">
                    <FiMapPin className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div>{lead.address}</div>
                      <div className="text-gray-500">PIN: {lead.pincode}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bike Details</label>
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{lead.brand_name} {lead.bike_name}</div>
                    <div className="text-gray-500">{lead.variant_name}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <FiClock className="mr-2 h-4 w-4 text-gray-400" />
                    {formatDate(lead.created_at)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <FiClock className="mr-2 h-4 w-4 text-gray-400" />
                    {formatDate(lead.updated_at)}
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Update Lead</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {getStatusOptions(lead.lead_type).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Assignment and admin notes features will be available after the database schema is updated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
            >
              {isUpdating && <FiRefreshCw className="animate-spin mr-2 h-4 w-4" />}
              {isUpdating ? 'Updating...' : 'Update Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLeadsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();

  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    if (!admin) return;

    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (leadTypeFilter) params.append('lead_type', leadTypeFilter);

      const response = await fetch(`/api/admin/leads?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads);
      setAdmins(data.admins);
      setTotalLeads(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [admin, currentPage, searchTerm, statusFilter, leadTypeFilter]);

  // Update lead
  const updateLead = useCallback(async (leadId: string, updates: any) => {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch('/api/admin/leads', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id: leadId, ...updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to update lead');
    }

    // Refresh leads after update
    await fetchLeads();
  }, [fetchLeads]);

  // Quick status update function
  const quickStatusUpdate = useCallback(async (leadId: string, newStatus: string) => {
    setUpdatingLeadId(leadId);
    try {
      await updateLead(leadId, { status: newStatus });
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status. Please try again.');
    } finally {
      setUpdatingLeadId(null);
    }
  }, [updateLead]);

  // Bulk selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  }, [leads]);

  const handleSelectLead = useCallback((leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
      setSelectAll(false);
    }
  }, []);

  // Bulk status update
  const handleBulkStatusUpdate = useCallback(async (newStatus: string) => {
    if (selectedLeads.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to update ${selectedLeads.length} lead(s) to status "${newStatus}"?`
    );
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('adminToken');
      const updatePromises = selectedLeads.map(leadId => 
        fetch('/api/admin/leads', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: leadId, status: newStatus }),
        })
      );

      await Promise.all(updatePromises);
      await fetchLeads();
      setSelectedLeads([]);
      setSelectAll(false);
      alert(`Successfully updated ${selectedLeads.length} lead(s)`);
    } catch (error) {
      console.error('Error updating leads:', error);
      alert('Failed to update some leads. Please try again.');
    }
  }, [selectedLeads, fetchLeads]);

  // Effects
  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchLeads();
    }
  }, [admin, fetchLeads]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, leadTypeFilter]);

  // Helper functions
  const getStatusBadge = (status: string, leadType: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      'new': { label: 'New', color: 'bg-blue-100 text-blue-800' },
      'contacted': { label: 'Contacted', color: 'bg-orange-100 text-orange-800' },
      'qualified': { label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
      'closed': { label: 'Closed', color: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleDeleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the lead from ${lead.name}?\n\n` +
      `Lead Type: ${lead.lead_type === 'get_on_road_price' ? 'Price Inquiry' : 'Test Ride'}\n` +
      `Bike: ${lead.brand_name} ${lead.bike_name}\n` +
      `Email: ${lead.email}\n\n` +
      `This action will mark the lead as closed and cannot be undone.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/leads?id=${lead.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete lead');
      }

      // Refresh leads after deletion
      await fetchLeads();
      
      // Show success message
      const successMsg = `Lead from ${lead.name} has been successfully marked as closed.`;
      alert(successMsg);
      
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert(`Failed to delete lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  if (isLoading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Leads Management" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header and Filters */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                  <p className="text-gray-600 mt-1">
                    Manage and track customer leads for test rides and price inquiries.
                  </p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <button
                    onClick={fetchLeads}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <FiDownload className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type</label>
                    <select
                      value={leadTypeFilter}
                      onChange={(e) => setLeadTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Types</option>
                      <option value="get_on_road_price">Get On-Road Price</option>
                      <option value="book_test_ride">Book Test Ride</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                        setLeadTypeFilter('');
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <FiUser className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Leads</p>
                    <p className="text-lg font-semibold text-gray-900">{totalLeads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-md">
                    <FiClock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">New Leads</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {leads.filter(lead => lead.status === 'new').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-md">
                    <FiEdit3 className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Contacted</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {leads.filter(lead => lead.status === 'contacted').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-md">
                    <FiUser className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {leads.filter(lead => lead.status === 'closed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedLeads.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiCheck className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium text-indigo-900">
                      {selectedLeads.length} lead(s) selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-indigo-700">Bulk update status to:</span>
                    <button
                      onClick={() => handleBulkStatusUpdate('contacted')}
                      className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full hover:bg-orange-200"
                    >
                      Contacted
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('qualified')}
                      className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full hover:bg-yellow-200"
                    >
                      Qualified
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('closed')}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                    >
                      Closed
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLeads([]);
                        setSelectAll(false);
                      }}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      <FiX className="h-3 w-3 mr-1 inline" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bike Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
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
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center">
                            <FiRefreshCw className="animate-spin h-5 w-5 text-gray-400 mr-2" />
                            Loading leads...
                          </div>
                        </td>
                      </tr>
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No leads found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className={`hover:bg-gray-50 ${selectedLeads.includes(lead.id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.address.slice(0, 30)}...</div>
                              <div className="text-xs text-gray-400">PIN: {lead.pincode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center text-sm text-gray-900">
                                <FiPhone className="mr-1 h-3 w-3" />
                                {lead.phone}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <FiMail className="mr-1 h-3 w-3" />
                                {lead.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {lead.brand_name} {lead.bike_name}
                              </div>
                              <div className="text-sm text-gray-500">{lead.variant_name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                lead.lead_type === 'get_on_road_price' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {lead.lead_type === 'get_on_road_price' ? 'Price Inquiry' : 'Test Ride'}
                              </span>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(lead.status, lead.lead_type)}
                                <select
                                  value={lead.status}
                                  onChange={(e) => quickStatusUpdate(lead.id, e.target.value)}
                                  disabled={updatingLeadId === lead.id}
                                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                                  title="Quick status update"
                                >
                                  <option value="new">New</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="qualified">Qualified</option>
                                  <option value="closed">Closed</option>
                                </select>
                                {updatingLeadId === lead.id && (
                                  <FiRefreshCw className="h-3 w-3 text-gray-400 animate-spin" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              N/A
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(lead.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleViewDetails(lead)}
                                className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                                title="View Lead Details"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditLead(lead)}
                                className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                title="Edit Lead Status"
                              >
                                <FiEdit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead)}
                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                title="Mark as Closed"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} results
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          const page = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                          if (page > totalPages) return null;
                          
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                page === currentPage
                                  ? 'text-white bg-indigo-600'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={showModal}
        onClose={handleCloseModal}
        onUpdate={updateLead}
        admins={admins}
      />
    </div>
  );
}