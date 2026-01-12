'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiSave, FiArrowLeft, FiUser, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';

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

export default function EditBookingPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

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
          setStatus(data.booking.status);
          setNotes(data.booking.notes || '');
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes: notes.trim() || null
        })
      });

      if (response.ok) {
        alert('Booking updated successfully');
        router.push('/admin/bookings');
      } else {
        const errorData = await response.json();
        alert(`Failed to update booking: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking');
    } finally {
      setSaving(false);
    }
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
        <AdminHeader title="Edit Booking" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Booking #{booking.booking_id}</h1>
                <p className="text-gray-600">Manage booking details and status</p>
              </div>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiArrowLeft className="mr-2" />
                Back to Bookings
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                    <p className="text-gray-900 font-medium">{booking.brand_name} {booking.model_name}</p>
                    <p className="text-gray-600 text-sm">{booking.variant_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <p className="text-gray-900 font-medium">₹{booking.price?.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                    <div className="flex items-center text-gray-900">
                      <FiCalendar className="mr-2" />
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-600">{new Date(booking.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="flex items-center text-gray-900">
                      <FiUser className="mr-2" />
                      {booking.user_name}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center text-gray-900">
                      <FiMail className="mr-2" />
                      {booking.user_email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center text-gray-900">
                      <FiPhone className="mr-2" />
                      {booking.user_phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dealer Information */}
              {booking.dealer_name && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Dealer Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Name</label>
                      <p className="text-gray-900">{booking.dealer_name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{booking.dealer_phone}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{booking.dealer_email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Booking</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any notes or comments..."
                    />
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}