'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiUser, FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';

interface ActivityItem {
  id: string;
  action: string;
  table_name: string;
  admin_name: string;
  created_at: string;
  details?: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/recent-activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Fallback to mock data
      setActivities([
        {
          id: '1',
          action: 'CREATE',
          table_name: 'brands',
          admin_name: 'Admin User',
          created_at: new Date().toISOString(),
          details: 'Created new brand: Honda'
        },
        {
          id: '2',
          action: 'UPDATE',
          table_name: 'variants',
          admin_name: 'Admin User',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          details: 'Updated variant specifications'
        },
        {
          id: '3',
          action: 'DELETE',
          table_name: 'models',
          admin_name: 'Super Admin',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          details: 'Removed discontinued model'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <FiPlus className="h-4 w-4 text-green-500" />;
      case 'UPDATE':
        return <FiEdit3 className="h-4 w-4 text-blue-500" />;
      case 'DELETE':
        return <FiTrash2 className="h-4 w-4 text-red-500" />;
      default:
        return <FiEdit3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'text-green-600 bg-green-50';
      case 'UPDATE':
        return 'text-blue-600 bg-blue-50';
      case 'DELETE':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <FiClock className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <FiClock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActionColor(activity.action).split(' ')[1]}`}>
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                        {activity.action.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{activity.table_name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">
                      {activity.details || `${activity.action} operation on ${activity.table_name}`}
                    </p>
                    <div className="flex items-center mt-1">
                      <FiUser className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{activity.admin_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}