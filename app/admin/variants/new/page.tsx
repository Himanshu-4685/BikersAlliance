'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import VariantImageUpload from '@/components/admin/VariantImageUpload';
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

interface VariantFormData {
  variant_id: string;
  variant_name: string;
  model_id: string;
  brand_id: string;
  on_road_price: string;
}

export default function NewVariantPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<VariantFormData>({
    variant_id: '',
    variant_name: '',
    model_id: '',
    brand_id: '',
    on_road_price: ''
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdVariantId, setCreatedVariantId] = useState<string | null>(null);
  const [suggestedVariantId, setSuggestedVariantId] = useState<number | null>(null);

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
      setFormData(prev => ({ ...prev, model_id: '' }));
    }
  }, [formData.brand_id]);

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

  const fetchSuggestedId = async () => {
    try {
      const response = await fetch('/api/admin/variants?limit=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Get max ID from variants and suggest next
        const maxResponse = await fetch('/api/admin/variants?limit=1000', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (maxResponse.ok) {
          const maxData = await maxResponse.json();
          const maxId = Math.max(...(maxData.variants?.map((v: any) => v.variant_id) || [577]));
          setSuggestedVariantId(maxId + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching suggested ID:', error);
      setSuggestedVariantId(578); // Fallback
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
    
    if (formData.variant_id && (isNaN(Number(formData.variant_id)) || Number(formData.variant_id) <= 0)) {
      newErrors.variant_id = 'Variant ID must be a positive number';
    }
    
    if (!formData.variant_name.trim()) {
      newErrors.variant_name = 'Variant name is required';
    }
    
    if (!formData.brand_id) {
      newErrors.brand_id = 'Brand is required';
    }
    
    if (!formData.model_id) {
      newErrors.model_id = 'Model is required';
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
      const response = await fetch('/api/admin/variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCreatedVariantId(result.variant.variant_id);
        // Don't redirect immediately, allow user to upload image first
        // Show success message instead
        alert('Variant created successfully! You can now upload an image for this variant.');
      } else {
        alert(result.error || 'Failed to create variant');
      }
    } catch (error) {
      console.error('Error creating variant:', error);
      alert('Error creating variant');
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
        <AdminHeader title="Add New Variant" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/variants')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add New Variant</h1>
                  <p className="text-gray-600 mt-1">Create a new motorcycle variant</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Variant ID */}
                <div>
                  <label htmlFor="variant_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Variant ID (Optional - Leave empty for auto-generation)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      id="variant_id"
                      name="variant_id"
                      value={formData.variant_id}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.variant_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter variant ID or leave empty for auto-generation"
                      min="1"
                    />
                    {suggestedVariantId && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, variant_id: suggestedVariantId.toString() }))}
                        className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        title={`Use suggested ID: ${suggestedVariantId}`}
                      >
                        Use {suggestedVariantId}
                      </button>
                    )}
                  </div>
                  {errors.variant_id && <p className="mt-1 text-sm text-red-600">{errors.variant_id}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to automatically assign the next available ID (recommended)
                    {suggestedVariantId && ` • Next suggested: ${suggestedVariantId}`}
                  </p>
                </div>

                {/* Variant Name */}
                <div>
                  <label htmlFor="variant_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Name *
                  </label>
                  <input
                    type="text"
                    id="variant_name"
                    name="variant_name"
                    value={formData.variant_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.variant_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter variant name"
                    required
                  />
                  {errors.variant_name && <p className="mt-1 text-sm text-red-600">{errors.variant_name}</p>}
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

                {/* On Road Price */}
                <div>
                  <label htmlFor="on_road_price" className="block text-sm font-medium text-gray-700 mb-2">
                    On Road Price
                  </label>
                  <input
                    type="number"
                    id="on_road_price"
                    name="on_road_price"
                    value={formData.on_road_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter price in INR"
                  />
                </div>

                {/* Image Upload - only show after variant is created */}
                {createdVariantId && (
                  <VariantImageUpload
                    variantId={createdVariantId}
                    onImageUploaded={(imageUrl) => {
                      // Image uploaded successfully
                      console.log('Image uploaded:', imageUrl);
                    }}
                    disabled={saving}
                  />
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/variants')}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    {createdVariantId ? 'Done' : 'Cancel'}
                  </button>
                  {!createdVariantId ? (
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
                          <span>Create Variant</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-sm text-green-600 flex items-center space-x-2">
                      <span>✓ Variant created successfully!</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}