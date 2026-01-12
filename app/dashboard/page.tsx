'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  FiPackage, 
  FiHeart, 
  FiActivity, 
  FiUser,
  FiLogOut,
  FiCalendar,
  FiBookOpen
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';
import { useWishlist } from '@/context/WishlistContext';
import DashboardOrders from '@/components/dashboard/DashboardOrders';
import DashboardShortlisted from '@/components/dashboard/DashboardShortlisted';
import DashboardActivity from '@/components/dashboard/DashboardActivity';
import DashboardProfileSettings from '@/components/dashboard/DashboardProfileSettings';
import DashboardBookings from '@/components/dashboard/DashboardBookings';

type DashboardSection = 'orders' | 'shortlisted' | 'bookings' | 'activity' | 'profile';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<DashboardSection>('orders');

  // Get section from URL params or default to orders
  useEffect(() => {
    const section = searchParams.get('section') as DashboardSection;
    if (section && ['orders', 'shortlisted', 'bookings', 'activity', 'profile'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

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

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    router.push(`/dashboard?section=${section}`, { scroll: false });
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

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: FiPackage },
    { id: 'shortlisted', label: 'Shortlisted Vehicles', icon: FiHeart },
    { id: 'bookings', label: 'My Bookings', icon: FiBookOpen },
    { id: 'activity', label: 'My Activity', icon: FiActivity },
    { id: 'profile', label: 'Profile Settings', icon: FiUser }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'orders':
        return <DashboardOrders />;
      case 'shortlisted':
        return <DashboardShortlisted />;
      case 'bookings':
        return <DashboardBookings />;
      case 'activity':
        return <DashboardActivity />;
      case 'profile':
        return <DashboardProfileSettings />;
      default:
        return <DashboardOrders />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow overflow-hidden sticky top-8">
              <div className="p-6">
                {/* User Profile Section */}
                <div className="flex flex-col items-center pb-6 border-b">
                  <div className="relative">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={displayName}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-white';
                            fallback.textContent = getInitials(displayName);
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-white">
                        {getInitials(displayName)}
                      </div>
                    )}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-gray-900">{displayName}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                
                {/* Navigation Menu */}
                <nav className="mt-6 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionChange(item.id as DashboardSection)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          isActive 
                            ? 'bg-primary text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
                
                {/* Logout Button */}
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}