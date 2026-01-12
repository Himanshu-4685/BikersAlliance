'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiBookOpen, 
  FiCalendar,
  FiEye,
  FiClock,
  FiCheck,
  FiX,
  FiPhone,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';

interface UserBooking {
  booking_id: number;
  user_id: string;
  variant_id: number;
  dealer_id?: number;
  booking_date: string;
  status: string;
  price: number;
  notes?: string;
  created_at: string;
  variant_name: string;
  model_name: string;
  brand_name: string;
  image_url?: string;
  dealer_name?: string;
  dealer_phone?: string;
  dealer_email?: string;
}

export default function DashboardBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/bookings?user_id=${user.id}&limit=20`, {
          credentials: 'include'
        });
        const result = await response.json();
        
        console.log('Bookings API Response:', { 
          status: response.status, 
          result, 
          userId: user.id 
        });

        if (response.ok && result.success) {
          setBookings(result.data?.bookings || []);
        } else {
          console.error('Failed to fetch bookings:', result.error);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'confirmed':
        return <FiCheck className="w-4 h-4" />;
      case 'cancelled':
        return <FiX className="w-4 h-4" />;
      case 'completed':
        return <FiCheck className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
            <p className="text-gray-600 mt-1">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
            </p>
          </div>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Bike Image */}
                  <div className="flex-shrink-0 w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={booking.image_url || '/demo.avif'}
                      alt={`${booking.brand_name} ${booking.model_name}`}
                      width={80}
                      height={64}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image load error, falling back to demo.avif');
                        (e.target as HTMLImageElement).src = '/demo.avif';
                      }}
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.brand_name} {booking.model_name}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">{booking.variant_name}</span>
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          Booked on {new Date(booking.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        {booking.booking_date && (
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            Booking Date: {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                        {booking.dealer_name && (
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <FiUser className="w-4 h-4 mr-1" />
                            Dealer: {booking.dealer_name}
                          </div>
                        )}
                        {booking.dealer_phone && (
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <FiPhone className="w-4 h-4 mr-1" />
                            Contact: {booking.dealer_phone}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full mb-2 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          ₹{booking.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {booking.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-3 pt-3 border-t">
                      <Link 
                        href={`/bikes/${booking.variant_id}`}
                        className="flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary-50 transition-colors"
                      >
                        <FiEye className="w-4 h-4 mr-2" />
                        View Bike Details
                      </Link>
                      
                      {booking.status === 'pending' && (
                        <div className="text-sm text-gray-500">
                          <span className="flex items-center">
                            <FiClock className="w-4 h-4 mr-1" />
                            Awaiting confirmation
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Summary Card */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bookings Summary</h3>
                  <p className="text-gray-600">
                    You have {bookings.length} booking{bookings.length !== 1 ? 's' : ''} in total
                  </p>
                  <div className="mt-2 flex space-x-4 text-sm">
                    <span className="text-yellow-600">
                      {bookings.filter(b => b.status === 'pending').length} Pending
                    </span>
                    <span className="text-green-600">
                      {bookings.filter(b => b.status === 'confirmed').length} Confirmed
                    </span>
                    <span className="text-blue-600">
                      {bookings.filter(b => b.status === 'completed').length} Completed
                    </span>
                  </div>
                </div>
                <Link 
                  href="/bikes/all"
                  className="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  Book More Bikes
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
              <FiBookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">
              You haven't booked any bikes yet. Start exploring our collection and book your favorite bikes.
            </p>
            <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
              <Link 
                href="/bikes/all"
                className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
              >
                Browse Bikes
              </Link>
              <Link 
                href="/scooters"
                className="inline-block px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Browse Scooters
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}