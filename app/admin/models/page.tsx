'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiImage } from 'react-icons/fi';

interface Model {
  model_id: number;
  model_name: string;
  brand_id: string;
  brand_name?: string;
  variants_count?: number;
}

export default function AdminModelsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchModels();
    }
  }, [admin, currentPage, searchTerm]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/models?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.status === 401) {
        // Unauthorized: redirect to admin login
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch models', response.status);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId: number) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setModels(models.filter(model => model.model_id !== modelId));
      } else {
        alert('Failed to delete model');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Error deleting model');
    }
  };

  const columns = [
    {
      key: 'model_id',
      label: 'ID',
      render: (model: Model) => model.model_id
    },
    {
      key: 'model_name',
      label: 'Model Name',
      sortable: true
    },
    {
      key: 'brand_name',
      label: 'Brand',
      render: (model: Model) => model.brand_name || '-'
    },
    {
      key: 'variants_count',
      label: 'Variants Count',
      render: (model: Model) => model.variants_count || 0
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (model: Model) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/models/${model.model_id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/models/${model.model_id}/edit`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(model.model_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
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
        <AdminHeader title="Models Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Models Management</h1>
                <p className="text-gray-600">Manage motorcycle models</p>
              </div>
              <button
                onClick={() => router.push('/admin/models/new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Model
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={models}
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