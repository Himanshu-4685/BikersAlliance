'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiEdit, FiTrash2 } from 'react-icons/fi';

interface User {
  user_id: string;
  id: string;
  full_name?: string;
  email: string;
  phone?: string;
  created_at: string;
  Img_url?: string;
  updated_at?: string;
  email_confirmed?: boolean;
  last_sign_in?: string;
}

export default function UserDetailsPage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId && admin) {
      fetchUser();
    }
  }, [userId, admin]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setError('Failed to load user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        router.push('/admin/users');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  if (!admin) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading user...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'User not found'}</p>
            <button
              onClick={() => router.push('/admin/users')}
              className="text-blue-600 hover:underline"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="User Details" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                  <p className="text-gray-600">View and manage user account</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push(`/admin/users/${userId}/edit`)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit className="w-4 h-4 mr-2" />
                  Edit User
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete User
                </button>
              </div>
            </div>

            {/* User Card */}
            <div className="bg-white rounded-lg shadow">
              {/* User Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {user.Img_url ? (
                      <img 
                        src={user.Img_url} 
                        alt={user.full_name || user.email}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {user.full_name || 'No name provided'}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                    {user.email_confirmed !== undefined && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user.email_confirmed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.email_confirmed ? 'Email Confirmed' : 'Email Unconfirmed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                        {user.id}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{user.full_name || 'Not provided'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center space-x-2">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Created
                      </label>
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {user.updated_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Updated
                        </label>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-900">
                            {new Date(user.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.last_sign_in && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Sign In
                        </label>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-900">
                            {new Date(user.last_sign_in).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
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