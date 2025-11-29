'use client';

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import useSWR from 'swr';
import { 
  FiUsers, 
  FiTruck, 
  FiShoppingBag, 
  FiTrendingUp,
  FiActivity,
  FiEye
} from 'react-icons/fi';
import { SkeletonCard } from '@/components/common/LoadingComponents';

// Lazy load heavy components
const RecentActivity = lazy(() => import('@/components/admin/RecentActivity'));



// SWR fetcher function
const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  
  return response.json();
};

interface DashboardStats {
  totalBrands: number;
  totalModels: number;
  totalVariants: number;
  totalBookings: number;
  totalUsers: number;
  monthlyGrowth: number;
}

export default function AdminDashboardPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  
  // Use SWR for data fetching with caching and revalidation
  const { data: statsData, error: statsError, isLoading: loadingStats } = useSWR(
    admin ? '/api/admin/dashboard-stats' : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  const stats = useMemo(() => statsData?.stats || {
    totalBrands: 0,
    totalModels: 0,
    totalVariants: 0,
    totalBookings: 0,
    totalUsers: 0,
    monthlyGrowth: 0
  }, [statsData]);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  // Memoized navigation handlers
  const handleNavigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Memoized stats cards configuration
  const statsCards = useMemo(() => [
    {
      title: "Total Brands",
      value: loadingStats ? '...' : stats.totalBrands.toString(),
      icon: <FiTruck className="h-6 w-6" />,
      change: "+2 this month",
      changeType: "positive" as const,
      color: "blue" as const
    },
    {
      title: "Total Models",
      value: loadingStats ? '...' : stats.totalModels.toString(),
      icon: <FiShoppingBag className="h-6 w-6" />,
      change: "+15 this month",
      changeType: "positive" as const,
      color: "green" as const
    },
    {
      title: "Total Variants",
      value: loadingStats ? '...' : stats.totalVariants.toString(),
      icon: <FiEye className="h-6 w-6" />,
      change: "+45 this month",
      changeType: "positive" as const,
      color: "purple" as const
    },
    {
      title: "Active Users",
      value: loadingStats ? '...' : stats.totalUsers.toString(),
      icon: <FiUsers className="h-6 w-6" />,
      change: `+${stats.monthlyGrowth}%`,
      changeType: "positive" as const,
      color: "orange" as const
    }
  ], [loadingStats, stats]);

  // Memoized secondary stats
  const secondaryStats = useMemo(() => [
    {
      title: "Total Bookings",
      value: loadingStats ? '...' : stats.totalBookings.toString(),
      icon: <FiShoppingBag className="h-5 w-5 text-yellow-600" />,
      bgColor: "bg-yellow-100"
    },
    {
      title: "Monthly Growth",
      value: loadingStats ? '...' : `+${stats.monthlyGrowth}%`,
      icon: <FiTrendingUp className="h-5 w-5 text-red-600" />,
      bgColor: "bg-red-100"
    },
    {
      title: "System Status",
      value: "Operational",
      icon: <FiActivity className="h-5 w-5 text-green-600" />,
      bgColor: "bg-green-100",
      valueColor: "text-green-600"
    }
  ], [loadingStats, stats]);

  if (isLoading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Dashboard" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {admin.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with BikersAlliance today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loadingStats ? (
                // Show skeleton loading
                Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : (
                // Show actual stats cards
                statsCards.map((card, index) => (
                  <StatsCard key={`${card.title}-${index}`} {...card} />
                ))
              )}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {secondaryStats.map((stat, index) => (
                <div key={`${stat.title}-${index}`} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`p-2 ${stat.bgColor} rounded-md`}>
                      {stat.icon}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className={`text-lg font-semibold ${stat.valueColor || 'text-gray-900'}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }>
                <RecentActivity />
              </Suspense>
              
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => handleNavigateTo('/admin/brands/new')}
                      className="w-full text-left px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FiTruck className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Add New Brand</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleNavigateTo('/admin/models/new')}
                      className="w-full text-left px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FiShoppingBag className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Add New Model</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleNavigateTo('/admin/variants/new')}
                      className="w-full text-left px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FiEye className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Add New Variant</span>
                      </div>
                    </button>
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