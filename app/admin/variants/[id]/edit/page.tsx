'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface Variant {
  variant_id: string;
  variant_name: string;
  model_id: string;
  brand_id: string;
  model_name?: string;
  brand_name?: string;
  on_road_price?: number;
}

interface VariantFormData {
  variant_name: string;
  model_id: string;
  brand_id: string;
  on_road_price: string;
}

export default function EditVariantPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const variantId = params.id as string;
  
  const [formData, setFormData] = useState<VariantFormData>({
    variant_name: '',
    model_id: '',
    brand_id: '',
    on_road_price: ''
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin && variantId) {
      fetchVariant();
      fetchBrands();
    }
  }, [admin, variantId]);

  useEffect(() => {
    if (formData.brand_id && brands.length > 0) {
      fetchModels(formData.brand_id);
    }
  }, [formData.brand_id, brands.length]);

  const fetchVariant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.variant) {
          const variant = result.variant;
          setFormData({
            variant_name: variant.variant_name || '',
            model_id: variant.model_id || '',
            brand_id: variant.brand_id || '',
            on_road_price: variant.on_road_price?.toString() || ''
          });
          
          // Fetch current image URL from images table
          try {
            const imageResponse = await fetch(`/api/admin/variants/${variantId}/image`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
              }
            });
            
            if (imageResponse.ok) {
              const imageResult = await imageResponse.json();
              if (imageResult.success && imageResult.imageUrl) {
                setCurrentImageUrl(imageResult.imageUrl);
              }
            }
          } catch (error) {
            console.error('Error fetching image:', error);
          }
        } else {
          router.push('/admin/variants');
        }
      } else {
        router.push('/admin/variants');
      }
    } catch (error) {
      console.error('Error fetching variant:', error);
      router.push('/admin/variants');
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
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/admin/variants');
      } else {
        alert(result.error || 'Failed to update variant');
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      alert('Error updating variant');
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
        <AdminHeader title="Edit Variant" />
        
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
                  <h1 className="text-2xl font-bold text-gray-900">Edit Variant</h1>
                  <p className="text-gray-600 mt-1">Update variant information</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Image Upload */}
                <VariantImageUpload
                  variantId={variantId}
                  currentImageUrl={currentImageUrl}
                  onImageUploaded={(imageUrl) => setCurrentImageUrl(imageUrl)}
                  disabled={saving}
                />

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/variants')}
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
                        <span>Update Variant</span>
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