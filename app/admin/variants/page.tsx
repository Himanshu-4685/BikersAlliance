'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

interface Variant {
  variant_id: number;
  variant_name: string;
  model_id: number;
  brand_id: string;
  model_name?: string;
  brand_name?: string;
  on_road_price?: number;
  url?: string;
  created_at: string;
}

export default function AdminVariantsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
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
      fetchVariants();
    }
  }, [admin, currentPage, searchTerm]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/variants?${params}`, {
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
        setVariants(data.variants || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch variants', response.status);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setVariants(variants.filter(variant => variant.variant_id !== variantId));
      } else {
        alert('Failed to delete variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Error deleting variant');
    }
  };

  const columns = [
    {
      key: 'variant_id',
      label: 'ID'
    },
    {
      key: 'variant_name',
      label: 'Variant Name',
      sortable: true
    },
    {
      key: 'model_name',
      label: 'Model',
      render: (variant: Variant) => variant.model_name || '-'
    },
    {
      key: 'brand_name',
      label: 'Brand',
      render: (variant: Variant) => variant.brand_name || '-'
    },
    {
      key: 'on_road_price',
      label: 'Price',
      render: (variant: Variant) => variant.on_road_price 
        ? `₹${variant.on_road_price.toLocaleString()}` 
        : '-'
    },
    {
      key: 'url',
      label: 'URL',
      render: (variant: Variant) => variant.url || '-'
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (variant: Variant) => new Date(variant.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (variant: Variant) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/variants/${variant.variant_id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/variants/${variant.variant_id}/edit`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(variant.variant_id)}
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
        <AdminHeader title="Variants Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Variants Management</h1>
                <p className="text-gray-600">Manage motorcycle variants</p>
              </div>
              <button
                onClick={() => router.push('/admin/variants/new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Variant
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search variants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={variants}
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