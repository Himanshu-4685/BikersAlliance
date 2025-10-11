'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiPackage, 
  FiHeart, 
  FiActivity, 
  FiSettings, 
  FiUser,
  FiChevronRight, 
  FiLogOut 
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    const { success } = await logout();
    if (success) {
      router.push('/login');
    }
  };

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Format user's name or email for display
  const displayName = user.fullName || 
                      user.email?.split('@')[0] || 
                      'User';
                      
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {getInitials(displayName)}
                </div>
                <h2 className="mt-4 text-xl font-bold">{displayName}</h2>
                <p className="text-gray-500">
                  {user.email || ''}
                </p>
                <button 
                  className="mt-2 text-primary text-sm hover:underline"
                  onClick={() => router.push('/profile/edit')}
                >
                  Link your e-mail or social account
                </button>
              </div>
              
              {/* Navigation Menu */}
              <div className="mt-8 space-y-1">
                <Link href="/dashboard/orders" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-primary">
                      <FiPackage size={20} />
                    </div>
                    <span className="ml-3 text-gray-900">My Orders</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </Link>
                
                <Link href="/dashboard/shortlisted" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-primary">
                      <FiHeart size={20} />
                    </div>
                    <span className="ml-3 text-gray-900">Shortlisted Vehicles</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </Link>
                
                <Link href="/dashboard/activity" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-primary">
                      <FiActivity size={20} />
                    </div>
                    <span className="ml-3 text-gray-900">My Activity</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </Link>
                
                <Link href="/dashboard/consents" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-primary">
                      <FiSettings size={20} />
                    </div>
                    <span className="ml-3 text-gray-900">Manage Consents</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </Link>
                
                <Link href="/dashboard/settings" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-primary">
                      <FiUser size={20} />
                    </div>
                    <span className="ml-3 text-gray-900">Profile Settings</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </Link>
              </div>
              
              {/* Logout Button */}
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                
                <div className="mt-8 flex flex-col items-center justify-center py-12">
                  <div className="w-40 h-40 mb-4">
                    <Image 
                      src="/images/empty-orders.png" 
                      alt="No orders found"
                      width={160}
                      height={160}
                      className="w-full h-full"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/Loading/no-data.svg';
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">No Orders Found</h3>
                  <p className="mt-2 text-gray-600 text-center">
                    No order yet. Start your auto explore journey and many more
                  </p>
                  <div className="mt-8">
                    <Link 
                      href="/bikes"
                      className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark"
                    >
                      Browse Vehicles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}