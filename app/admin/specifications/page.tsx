'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

interface Specification {
  variant_id: number;
  variant_name?: string;
  model_name?: string;
  brand_name?: string;
  engine_type?: string;
  displacement?: string;
  max_torque?: string;
  no_of_cylinders?: string;
  cooling_system?: string;
  city_mileage?: string;
  highway_mileage?: string;
  body_type?: string;
  peak_power?: string;
  transmission?: string;
}

export default function AdminSpecificationsPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [specifications, setSpecifications] = useState<Specification[]>([]);
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
      const debounceTimer = setTimeout(() => {
        setCurrentPage(1); // Reset to first page when searching
        fetchSpecifications();
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [admin, searchTerm]);

  useEffect(() => {
    if (admin) {
      fetchSpecifications();
    }
  }, [admin, currentPage]);

  const fetchSpecifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/specifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setSpecifications(data.specifications || []);
          setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
        } else {
          console.error('Failed to fetch specifications', response.status);
        }
    } catch (error) {
      console.error('Error fetching specifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this specification?')) return;

    try {
      const response = await fetch(`/api/admin/specifications/${variantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setSpecifications(specifications.filter(spec => spec.variant_id !== variantId));
      } else {
        alert('Failed to delete specification');
      }
    } catch (error) {
      console.error('Error deleting specification:', error);
      alert('Error deleting specification');
    }
  };

  const columns = [
    {
      key: 'variant_id',
      label: 'Variant ID'
    },
    {
      key: 'variant_name',
      label: 'Variant',
      render: (spec: Specification) => spec.variant_name || '-'
    },
    {
      key: 'model_name',
      label: 'Model',
      render: (spec: Specification) => spec.model_name || '-'
    },
    {
      key: 'brand_name',
      label: 'Brand',
      render: (spec: Specification) => spec.brand_name || '-'
    },
    {
      key: 'engine_type',
      label: 'Engine Type',
      render: (spec: Specification) => spec.engine_type || '-'
    },
    {
      key: 'displacement',
      label: 'Displacement',
      render: (spec: Specification) => spec.displacement || '-'
    },
    {
      key: 'max_torque',
      label: 'Max Torque',
      render: (spec: Specification) => spec.max_torque || '-'
    },
    {
      key: 'city_mileage',
      label: 'City Mileage',
      render: (spec: Specification) => spec.city_mileage || '-'
    },
    {
      key: 'peak_power',
      label: 'Peak Power',
      render: (spec: Specification) => spec.peak_power || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (spec: Specification) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/specifications/${spec.variant_id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/specifications/${spec.variant_id}/edit`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(spec.variant_id)}
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
        <AdminHeader title="Specifications Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Specifications Management</h1>
                <p className="text-gray-600">Manage motorcycle specifications</p>
              </div>
              <button
                onClick={() => router.push('/admin/specifications/new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Specification
              </button>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={specifications}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onRefresh={fetchSpecifications}
            />
          </div>
        </main>
      </div>
    </div>
  );
}