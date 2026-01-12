'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiPackage, 
  FiCalendar,
  FiTrash2,
  FiEye,
  FiBookOpen
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';

interface UserOrder {
  id: string;
  variant_id: number;
  bike_name: string;
  variant_name: string;
  price: number;
  brand_name: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

export default function DashboardOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [bookingOrder, setBookingOrder] = useState<string | null>(null);

  const getBikeUrl = (order: UserOrder) => {
    // Use variant_id as the URL parameter since that's what /api/bikes/[slug] expects
    return `/bikes/${order.variant_id}`;
  };

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/user-orders?user_id=${user.id}`, {
          credentials: 'include'
        });
        const result = await response.json();

        if (response.ok && result.success) {
          setOrders(result.orders);
        } else {
          console.error('Failed to fetch orders:', result.error);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleBookOrder = async (order: UserOrder) => {
    if (!confirm('Are you sure you want to book this bike?')) return;

    setBookingOrder(order.id);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user?.id,
          variant_id: order.variant_id,
          bike_name: order.bike_name,
          variant_name: order.variant_name,
          brand_name: order.brand_name,
          price: order.price,
          image_url: order.image_url
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Bike booked successfully! You will be contacted soon.');
      } else {
        alert('Failed to book bike. Please try again.');
      }
    } catch (error) {
      console.error('Error booking bike:', error);
      alert('Network error. Please try again.');
    } finally {
      setBookingOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to remove this order?')) return;

    setDeletingOrder(orderId);
    try {
      const response = await fetch(`/api/user-orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOrders(orders.filter(order => order.id !== orderId));
      } else {
        alert('Failed to remove order. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Network error. Please try again.');
    } finally {
      setDeletingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
            <p className="text-gray-600 mt-1">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Bike Image */}
                  <div className="flex-shrink-0 w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <Link href={getBikeUrl(order)}>
                      <Image
                        src={order.image_url || '/demo.avif'}
                        alt={order.bike_name}
                        width={80}
                        height={64}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/demo.avif';
                        }}
                      />
                    </Link>
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={getBikeUrl(order)}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary transition-colors cursor-pointer">
                            {order.bike_name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">{order.variant_name}</span> • {order.brand_name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-2 ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <div className="text-xl font-bold text-gray-900">
                          ₹{order.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 pt-3 border-t">
                      <Link 
                        href={getBikeUrl(order)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary-50 transition-colors"
                      >
                        <FiEye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                      
                      <button
                        onClick={() => handleBookOrder(order)}
                        disabled={bookingOrder === order.id}
                        className="flex items-center px-4 py-2 text-sm font-medium text-green-600 border border-green-300 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiBookOpen className="w-4 h-4 mr-2" />
                        {bookingOrder === order.id ? 'Booking...' : 'Book Now'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deletingOrder === order.id}
                        className="flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 className="w-4 h-4 mr-2" />
                        {deletingOrder === order.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FiPackage className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't added any bikes to your orders yet. Start exploring our collection and add bikes you're interested in.
            </p>
            <Link 
              href="/bikes"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
            >
              Browse Bikes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}