'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiImage } from 'react-icons/fi';

interface Brand {
  brand_id: string;
  brand_name: string;
  logo_url?: string;
  country?: string;
  description?: string;
  created_at: string;
  models_count?: number;
}

export default function AdminBrandsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
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
      fetchBrands();
    }
  }, [admin, currentPage, searchTerm]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm
      });

      const response = await fetch(`/api/admin/brands?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand? This will also delete all associated models and variants.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        fetchBrands();
        // Log the action
        if (admin) {
          await fetch('/api/admin/audit-log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            },
            body: JSON.stringify({
              action: 'DELETE',
              table_name: 'brands',
              record_id: brandId
            })
          });
        }
      } else {
        alert('Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Error deleting brand');
    }
  };

  const columns = [
    {
      key: 'logo_url',
      label: 'Logo',
      render: (brand: Brand) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {brand.logo_url ? (
            <img 
              src={brand.logo_url} 
              alt={brand.brand_name}
              className="w-full h-full object-contain"
            />
          ) : (
            <FiImage className="w-6 h-6 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'brand_name',
      label: 'Brand Name',
      sortable: true
    },
    {
      key: 'country',
      label: 'Country',
      render: (brand: Brand) => brand.country || '-'
    },
    {
      key: 'models_count',
      label: 'Models Count',
      render: (brand: Brand) => brand.models_count || 0
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (brand: Brand) => new Date(brand.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (brand: Brand) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/brands/${brand.brand_id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/brands/${brand.brand_id}/edit`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md"
            title="Edit Brand"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(brand.brand_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete Brand"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Brands Management" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Actions */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                <p className="text-gray-600 mt-1">Manage motorcycle brands and their information</p>
              </div>
              <button
                onClick={() => router.push('/admin/brands/new')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Brand</span>
              </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow">
              <DataTable
                data={brands}
                columns={columns}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onRefresh={fetchBrands}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}