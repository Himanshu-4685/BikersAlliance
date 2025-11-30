'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

interface Brand {
  brand_id: string;
  brand_name: string;
}

interface ModelFormData {
  model_id: string;
  model_name: string;
  brand_id: string;
}

export default function NewModelPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ModelFormData>({
    model_id: '',
    model_name: '',
    brand_id: ''
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestedModelId, setSuggestedModelId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchBrands();
      fetchSuggestedId();
    }
  }, [admin]);

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

  const fetchSuggestedId = async () => {
    try {
      const response = await fetch('/api/admin/models?limit=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const maxId = Math.max(...(data.models?.map((m: any) => m.model_id) || [141]));
        setSuggestedModelId(maxId + 1);
      }
    } catch (error) {
      console.error('Error fetching suggested ID:', error);
      setSuggestedModelId(142); // Fallback
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
    
    if (formData.model_id && (isNaN(Number(formData.model_id)) || Number(formData.model_id) <= 0)) {
      newErrors.model_id = 'Model ID must be a positive number';
    }
    
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
      const response = await fetch('/api/admin/models', {
        method: 'POST',
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
            action: 'CREATE',
            table_name: 'models',
            record_id: result.model.model_id
          })
        });

        router.push('/admin/models');
      } else {
        alert(result.error || 'Failed to create model');
      }
    } catch (error) {
      console.error('Error creating model:', error);
      alert('Error creating model');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !admin || loadingBrands) {
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
        <AdminHeader title="Add New Model" />
        
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
                  <h1 className="text-2xl font-bold text-gray-900">Add New Model</h1>
                  <p className="text-gray-600 mt-1">Create a new motorcycle model</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Model ID */}
                <div>
                  <label htmlFor="model_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Model ID (Optional - Leave empty for auto-generation)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      id="model_id"
                      name="model_id"
                      value={formData.model_id}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.model_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter model ID or leave empty for auto-generation"
                      min="1"
                    />
                    {suggestedModelId && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, model_id: suggestedModelId.toString() }))}
                        className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        title={`Use suggested ID: ${suggestedModelId}`}
                      >
                        Use {suggestedModelId}
                      </button>
                    )}
                  </div>
                  {errors.model_id && <p className="mt-1 text-sm text-red-600">{errors.model_id}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to automatically assign the next available ID (recommended)
                    {suggestedModelId && ` • Next suggested: ${suggestedModelId}`}
                  </p>
                </div>

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
                        <span>Create Model</span>
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