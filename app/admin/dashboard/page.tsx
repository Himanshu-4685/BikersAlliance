'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import RecentActivity from '@/components/admin/RecentActivity';
import { 
  FiUsers, 
  FiTruck, 
  FiShoppingBag, 
  FiTrendingUp,
  FiActivity,
  FiEye
} from 'react-icons/fi';

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
  const [stats, setStats] = useState<DashboardStats>({
    totalBrands: 0,
    totalModels: 0,
    totalVariants: 0,
    totalBookings: 0,
    totalUsers: 0,
    monthlyGrowth: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchDashboardStats();
    }
  }, [admin]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

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
              <StatsCard
                title="Total Brands"
                value={loadingStats ? '...' : stats.totalBrands.toString()}
                icon={<FiTruck className="h-6 w-6" />}
                change="+2 this month"
                changeType="positive"
                color="blue"
              />
              <StatsCard
                title="Total Models"
                value={loadingStats ? '...' : stats.totalModels.toString()}
                icon={<FiShoppingBag className="h-6 w-6" />}
                change="+15 this month"
                changeType="positive"
                color="green"
              />
              <StatsCard
                title="Total Variants"
                value={loadingStats ? '...' : stats.totalVariants.toString()}
                icon={<FiEye className="h-6 w-6" />}
                change="+45 this month"
                changeType="positive"
                color="purple"
              />
              <StatsCard
                title="Active Users"
                value={loadingStats ? '...' : stats.totalUsers.toString()}
                icon={<FiUsers className="h-6 w-6" />}
                change={`+${stats.monthlyGrowth}%`}
                changeType="positive"
                color="orange"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-md">
                    <FiShoppingBag className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loadingStats ? '...' : stats.totalBookings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-md">
                    <FiTrendingUp className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Monthly Growth</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loadingStats ? '...' : `+${stats.monthlyGrowth}%`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-md">
                    <FiActivity className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">System Status</p>
                    <p className="text-lg font-semibold text-green-600">Operational</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/admin/brands/new')}
                      className="w-full text-left px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FiTruck className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Add New Brand</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/models/new')}
                      className="w-full text-left px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FiShoppingBag className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Add New Model</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/variants/new')}
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