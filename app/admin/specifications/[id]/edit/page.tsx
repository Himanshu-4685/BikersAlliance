'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

interface Specification {
  variant_id: number;
  variant_name?: string;
  brand_name?: string;
  model_name?: string;
  body_type?: string;
  engine_type?: string;
  displacement?: string;
  max_power?: string;
  max_torque?: string;
  city_mileage?: string;
  highway_mileage?: string;
  peak_power?: string;
  fuel_capacity?: string;
  kerb_weight?: string;
  ground_clearance?: string;
  seat_height?: string;
  wheelbase?: string;
  front_brake?: string;
  rear_brake?: string;
  front_suspension?: string;
  rear_suspension?: string;
  front_tyre?: string;
  rear_tyre?: string;
  top_speed?: string;
  acceleration?: string;
}

export default function EditSpecificationPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const variantId = params.id as string;
  
  const [specification, setSpecification] = useState<Specification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Specification>>({});

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin && variantId) {
      fetchSpecification();
    }
  }, [admin, variantId]);

  const fetchSpecification = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/specifications/${variantId}`, {
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
        setSpecification(data.specification);
        setFormData(data.specification);
      } else {
        console.error('Failed to fetch specification');
      }
    } catch (error) {
      console.error('Error fetching specification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/specifications/${variantId}`, {
        method: 'PUT',
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
        alert(result.error || 'Failed to update specification');
      }
    } catch (error) {
      console.error('Error updating specification:', error);
      alert('Error updating specification');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !admin || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!specification) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader title="Specification Not Found" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Specification Not Found</h1>
                <p className="text-gray-600 mb-6">The specification you're trying to edit doesn't exist.</p>
                <button
                  onClick={() => router.push('/admin/specifications')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Specifications
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const specificationFields = [
    { key: 'body_type', label: 'Body Type', type: 'text' },
    { key: 'engine_type', label: 'Engine Type', type: 'text' },
    { key: 'displacement', label: 'Displacement', type: 'text' },
    { key: 'peak_power', label: 'Peak Power', type: 'text' },
    { key: 'max_torque', label: 'Max Torque', type: 'text' },
    { key: 'no_of_cylinders', label: 'No. of Cylinders', type: 'text' },
    { key: 'cooling_system', label: 'Cooling System', type: 'text' },
    { key: 'valve_per_cylinder', label: 'Valve per Cylinder', type: 'text' },
    { key: 'starting', label: 'Starting', type: 'text' },
    { key: 'fuel_supply', label: 'Fuel Supply', type: 'text' },
    { key: 'clutch', label: 'Clutch', type: 'text' },
    { key: 'ignition', label: 'Ignition', type: 'text' },
    { key: 'gear_box', label: 'Gear Box', type: 'text' },
    { key: 'bore', label: 'Bore', type: 'text' },
    { key: 'stroke', label: 'Stroke', type: 'text' },
    { key: 'compression_ratio', label: 'Compression Ratio', type: 'text' },
    { key: 'city_mileage', label: 'City Mileage', type: 'text' },
    { key: 'highway_mileage', label: 'Highway Mileage', type: 'text' },
    { key: 'zero_to_hundred', label: '0-100 km/h', type: 'text' },
    { key: 'transmission', label: 'Transmission', type: 'text' },
    { key: 'other_features', label: 'Other Features', type: 'text' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Edit Specification" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/specifications')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-4"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Specifications
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit {specification.brand_name} {specification.model_name} {specification.variant_name}
                  </h1>
                  <p className="text-gray-600">Update specification details</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-medium text-gray-900">Specification Details</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                {/* Read-only fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variant ID
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                      {specification.variant_id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                      {specification.brand_name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                      {specification.model_name}
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specificationFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.key}
                        value={formData[field.key as keyof Specification] || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/specifications')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4 mr-2" />
                        Save Changes
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