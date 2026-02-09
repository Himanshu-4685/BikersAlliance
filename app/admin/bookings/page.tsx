'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiEye, FiEdit, FiTrash2, FiCalendar, FiUser, FiPhone } from 'react-icons/fi';

interface Booking {
  booking_id: number;
  user_id?: number;
  variant_id?: number;
  dealer_id?: number;
  booking_date: string;
  status: string;
  price?: number;
  notes?: string;
  created_at: string;
  user_name?: string;
  variant_name?: string;
  model_name?: string;
  brand_name?: string;
  dealer_name?: string;
}

export default function AdminBookingsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
      fetchBookings();
    }
  }, [admin, currentPage, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'booking_id',
      label: 'ID',
      render: (booking: Booking) => `#${booking.booking_id}`
    },
    {
      key: 'user_name',
      label: 'Customer',
      render: (booking: Booking) => (
        <div className="flex items-center">
          <FiUser className="w-4 h-4 text-gray-400 mr-2" />
          {booking.user_name || 'Unknown'}
        </div>
      )
    },
    {
      key: 'variant_name',
      label: 'Vehicle',
      render: (booking: Booking) => {
        if (booking.variant_name) {
          // Check if variant_name already contains brand name to avoid duplication
          const variantName = booking.variant_name;
          const brandName = booking.brand_name || '';
          
          // If variant already starts with brand name, just return variant name
          if (variantName.toLowerCase().startsWith(brandName.toLowerCase())) {
            return variantName;
          }
          
          // Otherwise, construct the full name
          return `${brandName} ${booking.model_name || ''} ${variantName}`.trim();
        }
        return '-';
      }
    },
    {
      key: 'dealer_name',
      label: 'Dealer',
      render: (booking: Booking) => booking.dealer_name || '-'
    },
    {
      key: 'booking_date',
      label: 'Booking Date',
      render: (booking: Booking) => (
        <div className="flex items-center">
          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
          {new Date(booking.booking_date).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (booking: Booking) => booking.price 
        ? `₹${booking.price.toLocaleString()}` 
        : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (booking: Booking) => (
        <select
          value={booking.status}
          onChange={(e) => handleStatusUpdate(booking.booking_id, e.target.value)}
          className="text-xs border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (booking: Booking) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/bookings/${booking.booking_id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/bookings/${booking.booking_id}/edit`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
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
        <AdminHeader title="Bookings Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
              <p className="text-gray-600">Manage customer bookings and test drives</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-4">
              <input
                type="text"
                placeholder="Search bookings..."
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={bookings}
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