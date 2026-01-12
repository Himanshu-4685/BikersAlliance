'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiCalendar, FiEdit } from 'react-icons/fi';

interface Booking {
  booking_id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  variant_id: number;
  variant_name: string;
  model_name: string;
  brand_name: string;
  dealer_id?: number;
  dealer_name: string;
  dealer_phone: string;
  dealer_email: string;
  booking_date: string;
  status: string;
  price: number;
  notes?: string;
  created_at: string;
}

export default function ViewBookingPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin && bookingId) {
      fetchBooking();
    }
  }, [admin, bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      
      // Use the specific booking endpoint
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Booking API response:', data);
        
        if (data.success && data.booking) {
          setBooking(data.booking);
        } else {
          console.error('Invalid response format:', data);
          alert('Invalid booking data format');
          router.push('/admin/bookings');
        }
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        alert(`Failed to fetch booking: ${response.status} ${errorText}`);
        router.push('/admin/bookings');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert(`Error loading booking details: ${error}`);
      router.push('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!admin || !booking) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="View Booking" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.booking_id}</h1>
                <p className="text-gray-600">Booking details and customer information</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/admin/bookings/${booking.booking_id}/edit`)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiEdit className="mr-2" />
                  Edit Booking
                </button>
                <button
                  onClick={() => router.push('/admin/bookings')}
                  className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to Bookings
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                    <p className="text-gray-900 font-medium text-lg">{booking.brand_name} {booking.model_name}</p>
                    <p className="text-gray-600">{booking.variant_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <p className="text-gray-900 font-bold text-xl">₹{booking.price?.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                    <div className="flex items-center text-gray-900">
                      <FiCalendar className="mr-2 text-gray-500" />
                      {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                    <p className="text-gray-600">{new Date(booking.created_at).toLocaleString('en-IN')}</p>
                  </div>

                  {booking.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700">{booking.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="flex items-center text-gray-900">
                      <FiUser className="mr-2 text-gray-500" />
                      <span className="font-medium">{booking.user_name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center text-gray-900">
                      <FiMail className="mr-2 text-gray-500" />
                      <a href={`mailto:${booking.user_email}`} className="text-blue-600 hover:text-blue-800">
                        {booking.user_email}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center text-gray-900">
                      <FiPhone className="mr-2 text-gray-500" />
                      <a href={`tel:${booking.user_phone}`} className="text-blue-600 hover:text-blue-800">
                        {booking.user_phone}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <p className="text-gray-600 font-mono text-sm">{booking.user_id}</p>
                  </div>
                </div>
              </div>

              {/* Dealer Information */}
              {booking.dealer_name && booking.dealer_name !== 'N/A' && (
                <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Dealer Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Name</label>
                      <p className="text-gray-900 font-medium">{booking.dealer_name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <a href={`tel:${booking.dealer_phone}`} className="text-blue-600 hover:text-blue-800">
                        {booking.dealer_phone}
                      </a>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <a href={`mailto:${booking.dealer_email}`} className="text-blue-600 hover:text-blue-800">
                        {booking.dealer_email}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Details */}
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <p className="text-gray-900 font-medium">{booking.brand_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <p className="text-gray-900 font-medium">{booking.model_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                    <p className="text-gray-900 font-medium">{booking.variant_name}</p>
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