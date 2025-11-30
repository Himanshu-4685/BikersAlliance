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

interface Model {
  model_id: string;
  model_name: string;
  brand_id: string;
}

interface Variant {
  variant_id: string;
  variant_name: string;
  model_id: string;
}

interface StatusFormData {
  status_id: string;
  brand_id: string;
  model_id: string;
  variant_id: string;
  status: string;
  price_range: string;
  expected_launch: string;
  launch_date: string;
}

export default function NewStatusPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<StatusFormData>({
    status_id: '',
    brand_id: '',
    model_id: '',
    variant_id: '',
    status: '',
    price_range: '',
    expected_launch: '',
    launch_date: ''
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestedStatusId, setSuggestedStatusId] = useState<number | null>(null);

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

  useEffect(() => {
    if (formData.brand_id) {
      fetchModels(formData.brand_id);
    } else {
      setModels([]);
      setVariants([]);
      setFormData(prev => ({ ...prev, model_id: '', variant_id: '' }));
    }
  }, [formData.brand_id]);

  useEffect(() => {
    if (formData.model_id) {
      fetchVariants(formData.model_id);
    } else {
      setVariants([]);
      setFormData(prev => ({ ...prev, variant_id: '' }));
    }
  }, [formData.model_id]);

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

  const fetchModels = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/models?brandId=${brandId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchVariants = async (modelId: string) => {
    try {
      const response = await fetch(`/api/admin/variants?modelId=${modelId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVariants(data.variants || []);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const fetchSuggestedId = async () => {
    try {
      const response = await fetch('/api/admin/status?limit=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const maxId = Math.max(...(data.statuses?.map((s: any) => s.status_id) || [9]));
        setSuggestedStatusId(maxId + 1);
      }
    } catch (error) {
      console.error('Error fetching suggested ID:', error);
      setSuggestedStatusId(10); // Fallback
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
    
    if (formData.status_id && (isNaN(Number(formData.status_id)) || Number(formData.status_id) <= 0)) {
      newErrors.status_id = 'Status ID must be a positive number';
    }
    
    if (!formData.brand_id) {
      newErrors.brand_id = 'Brand is required';
    }
    
    if (!formData.model_id) {
      newErrors.model_id = 'Model is required';
    }
    
    if (!formData.variant_id) {
      newErrors.variant_id = 'Variant is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
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
      const response = await fetch('/api/admin/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/admin/status');
      } else {
        alert(result.error || 'Failed to create status');
      }
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Error creating status');
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

  const statusOptions = [
    { value: 'new_launch', label: 'New Launch' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'discontinued', label: 'Discontinued' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Add New Status" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/status')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add New Status</h1>
                  <p className="text-gray-600 mt-1">Create status for a bike variant</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status ID */}
                <div>
                  <label htmlFor="status_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Status ID (Optional - Leave empty for auto-generation)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      id="status_id"
                      name="status_id"
                      value={formData.status_id}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.status_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter status ID or leave empty for auto-generation"
                      min="1"
                    />
                    {suggestedStatusId && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status_id: suggestedStatusId.toString() }))}
                        className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        title={`Use suggested ID: ${suggestedStatusId}`}
                      >
                        Use {suggestedStatusId}
                      </button>
                    )}
                  </div>
                  {errors.status_id && <p className="mt-1 text-sm text-red-600">{errors.status_id}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to automatically assign the next available ID (recommended)
                    {suggestedStatusId && ` • Next suggested: ${suggestedStatusId}`}
                  </p>
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

                {/* Model */}
                <div>
                  <label htmlFor="model_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <select
                    id="model_id"
                    name="model_id"
                    value={formData.model_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.model_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={!formData.brand_id}
                  >
                    <option value="">Select a model</option>
                    {models.map(model => (
                      <option key={model.model_id} value={model.model_id}>
                        {model.model_name}
                      </option>
                    ))}
                  </select>
                  {errors.model_id && <p className="mt-1 text-sm text-red-600">{errors.model_id}</p>}
                </div>

                {/* Variant */}
                <div>
                  <label htmlFor="variant_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Variant *
                  </label>
                  <select
                    id="variant_id"
                    name="variant_id"
                    value={formData.variant_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.variant_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={!formData.model_id}
                  >
                    <option value="">Select a variant</option>
                    {variants.map(variant => (
                      <option key={variant.variant_id} value={variant.variant_id}>
                        {variant.variant_name}
                      </option>
                    ))}
                  </select>
                  {errors.variant_id && <p className="mt-1 text-sm text-red-600">{errors.variant_id}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select status</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                </div>

                {/* Price Range */}
                <div>
                  <label htmlFor="price_range" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <input
                    type="text"
                    id="price_range"
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., ₹1.2 - 1.5 Lakh"
                  />
                </div>

                {/* Expected Launch */}
                <div>
                  <label htmlFor="expected_launch" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Launch
                  </label>
                  <input
                    type="text"
                    id="expected_launch"
                    name="expected_launch"
                    value={formData.expected_launch}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Q2 2024"
                  />
                </div>

                {/* Launch Date */}
                <div>
                  <label htmlFor="launch_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Launch Date
                  </label>
                  <input
                    type="date"
                    id="launch_date"
                    name="launch_date"
                    value={formData.launch_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/status')}
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
                        <span>Create Status</span>
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