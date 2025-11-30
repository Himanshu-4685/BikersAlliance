'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

interface Variant {
  variant_id: string;
  variant_name: string;
  model_name?: string;
  brand_name?: string;
}

interface SpecFormData {
  variant_id: string;
  engine_type: string;
  displacement: string;
  max_torque: string;
  no_of_cylinders: string;
  cooling_system: string;
  valve_per_cylinder: string;
  starting: string;
  fuel_supply: string;
  clutch: string;
  ignition: string;
  gear_box: string;
  bore: string;
  stroke: string;
  compression_ratio: string;
  city_mileage: string;
  highway_mileage: string;
  body_type: string;
  zero_to_hundred: string;
  peak_power: string;
  transmission: string;
  other_features: string;
}

export default function NewSpecPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<SpecFormData>({
    variant_id: '',
    engine_type: '',
    displacement: '',
    max_torque: '',
    no_of_cylinders: '',
    cooling_system: '',
    valve_per_cylinder: '',
    starting: '',
    fuel_supply: '',
    clutch: '',
    ignition: '',
    gear_box: '',
    bore: '',
    stroke: '',
    compression_ratio: '',
    city_mileage: '',
    highway_mileage: '',
    body_type: '',
    zero_to_hundred: '',
    peak_power: '',
    transmission: '',
    other_features: ''
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [variantDropdownOpen, setVariantDropdownOpen] = useState(false);
  const [variantSearchTerm, setVariantSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchVariants();
    }
  }, [admin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (variantDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setVariantDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [variantDropdownOpen]);

  // Filter variants based on search term
  const filteredVariants = variants.filter(variant => {
    if (!variantSearchTerm) return true;
    const searchLower = variantSearchTerm.toLowerCase();
    return (
      variant.variant_name.toLowerCase().includes(searchLower) ||
      variant.model_name?.toLowerCase().includes(searchLower) ||
      variant.brand_name?.toLowerCase().includes(searchLower)
    );
  });

  const fetchVariants = async () => {
    try {
      setLoadingVariants(true);
      const response = await fetch('/api/admin/variants?limit=1000', {
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
    } finally {
      setLoadingVariants(false);
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
    
    if (!formData.variant_id) {
      newErrors.variant_id = 'Variant is required';
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
      const response = await fetch('/api/admin/specifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/admin/specifications');
      } else {
        alert(result.error || 'Failed to create specification');
      }
    } catch (error) {
      console.error('Error creating specification:', error);
      alert('Error creating specification');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !admin || loadingVariants) {
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
        <AdminHeader title="Add New Specification" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/specifications')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add New Specification</h1>
                  <p className="text-gray-600 mt-1">Create specifications for a variant</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Searchable Variant Dropdown */}
                <div className="relative">
                  <label htmlFor="variant_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Variant *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search and select a variant..."
                      value={variantSearchTerm || (formData.variant_id ? variants.find(v => v.variant_id === formData.variant_id)?.variant_name || '' : '')}
                      onChange={(e) => {
                        setVariantSearchTerm(e.target.value);
                        setVariantDropdownOpen(true);
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, variant_id: '' }));
                        }
                      }}
                      onFocus={() => setVariantDropdownOpen(true)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.variant_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {/* Dropdown */}
                    {variantDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredVariants.length === 0 ? (
                          <div className="px-3 py-2 text-gray-500">No variants found</div>
                        ) : (
                          filteredVariants.map(variant => (
                            <button
                              key={variant.variant_id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, variant_id: variant.variant_id }));
                                setVariantSearchTerm('');
                                setVariantDropdownOpen(false);
                                if (errors.variant_id) {
                                  setErrors(prev => ({ ...prev, variant_id: '' }));
                                }
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              <div className="font-medium">{variant.brand_name} {variant.model_name}</div>
                              <div className="text-sm text-gray-600">{variant.variant_name}</div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {errors.variant_id && <p className="mt-1 text-sm text-red-600">{errors.variant_id}</p>}
                </div>

                {/* Engine Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="engine_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Engine Type
                    </label>
                    <input
                      type="text"
                      id="engine_type"
                      name="engine_type"
                      value={formData.engine_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Single Cylinder, 4 Stroke"
                    />
                  </div>

                  <div>
                    <label htmlFor="displacement" className="block text-sm font-medium text-gray-700 mb-2">
                      Displacement (cc)
                    </label>
                    <input
                      type="number"
                      id="displacement"
                      name="displacement"
                      value={formData.displacement}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 150"
                    />
                  </div>

                  <div>
                    <label htmlFor="max_torque" className="block text-sm font-medium text-gray-700 mb-2">
                      Max Torque
                    </label>
                    <input
                      type="text"
                      id="max_torque"
                      name="max_torque"
                      value={formData.max_torque}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 13.25 Nm @ 6500 RPM"
                    />
                  </div>

                  <div>
                    <label htmlFor="peak_power" className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Power
                    </label>
                    <input
                      type="text"
                      id="peak_power"
                      name="peak_power"
                      value={formData.peak_power}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 15.2 PS @ 8500 RPM"
                    />
                  </div>

                  <div>
                    <label htmlFor="no_of_cylinders" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Cylinders
                    </label>
                    <input
                      type="number"
                      id="no_of_cylinders"
                      name="no_of_cylinders"
                      value={formData.no_of_cylinders}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 1"
                    />
                  </div>

                  <div>
                    <label htmlFor="cooling_system" className="block text-sm font-medium text-gray-700 mb-2">
                      Cooling System
                    </label>
                    <input
                      type="text"
                      id="cooling_system"
                      name="cooling_system"
                      value={formData.cooling_system}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Air Cooled"
                    />
                  </div>

                  <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission
                    </label>
                    <input
                      type="text"
                      id="transmission"
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 5 Speed"
                    />
                  </div>

                  <div>
                    <label htmlFor="body_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Body Type
                    </label>
                    <input
                      type="text"
                      id="body_type"
                      name="body_type"
                      value={formData.body_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Commuter"
                    />
                  </div>

                  <div>
                    <label htmlFor="city_mileage" className="block text-sm font-medium text-gray-700 mb-2">
                      City Mileage (kmpl)
                    </label>
                    <input
                      type="number"
                      id="city_mileage"
                      name="city_mileage"
                      value={formData.city_mileage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <label htmlFor="highway_mileage" className="block text-sm font-medium text-gray-700 mb-2">
                      Highway Mileage (kmpl)
                    </label>
                    <input
                      type="number"
                      id="highway_mileage"
                      name="highway_mileage"
                      value={formData.highway_mileage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 55"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/specifications')}
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
                        <span>Create Specification</span>
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