'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiTrendingUp } from 'react-icons/fi';

interface Status {
  status_id: number;
  model_id: number;
  status_type: 'launched' | 'upcoming' | 'discontinued';
  launch_date?: string;
  expected_launch?: string;
  price_range?: string;
  notes?: string;
  created_at: string;
  model_name?: string;
  brand_name?: string;
}

export default function AdminStatusPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    launched: 0,
    upcoming: 0,
    discontinued: 0
  });
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchStatuses();
    }
  }, [admin, currentPage, searchTerm, statusFilter]);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/status?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatuses(data.statuses || []);
        setStats(data.stats || { launched: 0, upcoming: 0, discontinued: 0 });
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch statuses');
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (statusId: number) => {
    if (!confirm('Are you sure you want to delete this status?')) return;

    try {
      const response = await fetch(`/api/admin/status/${statusId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setStatuses(statuses.filter(status => status.status_id !== statusId));
      } else {
        alert('Failed to delete status');
      }
    } catch (error) {
      console.error('Error deleting status:', error);
      alert('Error deleting status');
    }
  };

  const getStatusBadge = (statusType: string) => {
    const statusStyles = {
      launched: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      discontinued: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[statusType as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {statusType}
      </span>
    );
  };

  const columns = [
    {
      key: 'model_name',
      label: 'Model',
      render: (status: Status) => (
        <div>
          <div className="font-medium text-gray-900">
            {status.brand_name} {status.model_name}
          </div>
        </div>
      )
    },
    {
      key: 'status_type',
      label: 'Status',
      render: (status: Status) => getStatusBadge(status.status_type)
    },
    {
      key: 'launch_date',
      label: 'Launch Date',
      render: (status: Status) => {
        if (status.status_type === 'launched' && status.launch_date) {
          return new Date(status.launch_date).toLocaleDateString();
        } else if (status.status_type === 'upcoming' && status.expected_launch) {
          return `Expected: ${new Date(status.expected_launch).toLocaleDateString()}`;
        }
        return '-';
      }
    },
    {
      key: 'price_range',
      label: 'Price Range',
      render: (status: Status) => status.price_range || '-'
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (status: Status) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {status.notes || '-'}
          </p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (status: Status) => new Date(status.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (status: Status) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/status/${status.status_id}/edit`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(status.status_id)}
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
        <AdminHeader title="Status & Launches Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Status & Launches Management</h1>
                <p className="text-gray-600">Manage motorcycle launch status and schedules</p>
              </div>
              <button
                onClick={() => router.push('/admin/status/new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Status
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FiTrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Launched</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.launched}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FiCalendar className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FiTrendingUp className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Discontinued</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.discontinued}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-4">
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="launched">Launched</option>
                <option value="upcoming">Upcoming</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={statuses}
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