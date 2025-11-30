'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

interface Brand {
  brand_id: string;
  brand_name: string;
}

interface Model {
  model_id: string;
  model_name: string;
  brand_id: string;
  brand_name?: string;
  description?: string;
  image_url?: string;
  launch_date?: string;
}

interface ModelFormData {
  model_name: string;
  brand_id: string;
}

export default function EditModelPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const modelId = params.id as string;
  
  const [formData, setFormData] = useState<ModelFormData>({
    model_name: '',
    brand_id: ''
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin && modelId) {
      fetchModel();
      fetchBrands();
    }
  }, [admin, modelId]);

  const fetchModel = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/models/${modelId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.model) {
          const model = result.model;
          setFormData({
            model_name: model.model_name || '',
            brand_id: model.brand_id || ''
          });
        } else {
          router.push('/admin/models');
        }
      } else {
        router.push('/admin/models');
      }
    } catch (error) {
      console.error('Error fetching model:', error);
      router.push('/admin/models');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const response = await fetch('/api/admin/brands?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.model_name.trim()) {
      newErrors.model_name = 'Model name is required';
    }
    
    if (!formData.brand_id) {
      newErrors.brand_id = 'Brand is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Log the action
        await fetch('/api/admin/audit-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({
            action: 'UPDATE',
            table_name: 'models',
            record_id: modelId
          })
        });

        router.push('/admin/models');
      } else {
        alert(result.error || 'Failed to update model');
      }
    } catch (error) {
      console.error('Error updating model:', error);
      alert('Error updating model');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !admin || loading || loadingBrands) {
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
        <AdminHeader title="Edit Model" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/models')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Model</h1>
                  <p className="text-gray-600 mt-1">Update model information</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Model Name */}
                <div>
                  <label htmlFor="model_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    id="model_name"
                    name="model_name"
                    value={formData.model_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.model_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter model name"
                    required
                  />
                  {errors.model_name && <p className="mt-1 text-sm text-red-600">{errors.model_name}</p>}
                </div>

                {/* Brand */}
                <div>
                  <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <select
                    id="brand_id"
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.brand_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select a brand</option>
                    {brands.map(brand => (
                      <option key={brand.brand_id} value={brand.brand_id}>
                        {brand.brand_name}
                      </option>
                    ))}
                  </select>
                  {errors.brand_id && <p className="mt-1 text-sm text-red-600">{errors.brand_id}</p>}
                </div>



                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/models')}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        <span>Update Model</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}