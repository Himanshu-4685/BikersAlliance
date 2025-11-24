'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiMail, FiSend, FiUsers, FiDownload, FiTrash2 } from 'react-icons/fi';

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
  status: 'active' | 'unsubscribed';
}

interface Campaign {
  id: number;
  subject: string;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  sent_at: string;
  status: 'draft' | 'sent' | 'scheduled';
}

export default function AdminNewsletterPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalCampaigns: 0,
    averageOpenRate: 0
  });
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchData();
    }
  }, [admin, activeTab, currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const endpoint = activeTab === 'subscribers' ? 'subscribers' : 'campaigns';
      const response = await fetch(`/api/admin/newsletter/${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'subscribers') {
          setSubscribers(data.subscribers || []);
          setStats(prev => ({ ...prev, ...data.stats }));
        } else {
          setCampaigns(data.campaigns || []);
        }
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error(`Failed to fetch ${activeTab}`);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriberId: number) => {
    if (!confirm('Are you sure you want to unsubscribe this user?')) return;

    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${subscriberId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'unsubscribed' })
      });

      if (response.ok) {
        fetchData(); // Refresh the list
      } else {
        alert('Failed to unsubscribe user');
      }
    } catch (error) {
      console.error('Error unsubscribing user:', error);
      alert('Error unsubscribing user');
    }
  };

  const handleExportSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subscribers.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export subscribers');
      }
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      alert('Error exporting subscribers');
    }
  };

  const subscriberColumns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (subscriber: Subscriber) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          subscriber.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {subscriber.status}
        </span>
      )
    },
    {
      key: 'subscribed_at',
      label: 'Subscribed',
      render: (subscriber: Subscriber) => new Date(subscriber.subscribed_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (subscriber: Subscriber) => (
        <div className="flex items-center space-x-2">
          {subscriber.status === 'active' && (
            <button
              onClick={() => handleUnsubscribe(subscriber.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Unsubscribe"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const campaignColumns = [
    {
      key: 'subject',
      label: 'Subject',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (campaign: Campaign) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          campaign.status === 'sent' 
            ? 'bg-green-100 text-green-800' 
            : campaign.status === 'scheduled'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {campaign.status}
        </span>
      )
    },
    {
      key: 'sent_count',
      label: 'Recipients',
      render: (campaign: Campaign) => campaign.sent_count.toLocaleString()
    },
    {
      key: 'open_rate',
      label: 'Open Rate',
      render: (campaign: Campaign) => `${campaign.open_rate.toFixed(1)}%`
    },
    {
      key: 'click_rate',
      label: 'Click Rate',
      render: (campaign: Campaign) => `${campaign.click_rate.toFixed(1)}%`
    },
    {
      key: 'sent_at',
      label: 'Sent At',
      render: (campaign: Campaign) => campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : '-'
    }
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Newsletter Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
                <p className="text-gray-600">Manage subscribers and email campaigns</p>
              </div>
              <div className="flex items-center space-x-2">
                {activeTab === 'subscribers' && (
                  <button
                    onClick={handleExportSubscribers}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiDownload className="w-4 h-4 mr-2" />
                    Export
                  </button>
                )}
                <button
                  onClick={() => router.push('/admin/newsletter/compose')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiSend className="w-4 h-4 mr-2" />
                  New Campaign
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FiUsers className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSubscribers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FiMail className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FiSend className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageOpenRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('subscribers')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'subscribers'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Subscribers
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'campaigns'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Campaigns
                </button>
              </nav>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data Table */}
            <DataTable
              columns={activeTab === 'subscribers' ? subscriberColumns : campaignColumns}
              data={activeTab === 'subscribers' ? subscribers : campaigns}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}