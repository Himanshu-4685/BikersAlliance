'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';

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
  created_at?: string;
  updated_at?: string;
}

export default function ViewSpecificationPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const variantId = params.id as string;
  
  const [specification, setSpecification] = useState<Specification | null>(null);
  const [loading, setLoading] = useState(true);

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
      } else {
        console.error('Failed to fetch specification');
      }
    } catch (error) {
      console.error('Error fetching specification:', error);
    } finally {
      setLoading(false);
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
                <p className="text-gray-600 mb-6">The specification you're looking for doesn't exist.</p>
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
    { key: 'variant_id', label: 'Variant ID', value: specification.variant_id },
    { key: 'variant_name', label: 'Variant Name', value: specification.variant_name },
    { key: 'brand_name', label: 'Brand', value: specification.brand_name },
    { key: 'model_name', label: 'Model', value: specification.model_name },
    { key: 'body_type', label: 'Body Type', value: specification.body_type },
    { key: 'engine_type', label: 'Engine Type', value: specification.engine_type },
    { key: 'displacement', label: 'Displacement', value: specification.displacement },
    { key: 'max_power', label: 'Max Power', value: specification.max_power },
    { key: 'max_torque', label: 'Max Torque', value: specification.max_torque },
    { key: 'city_mileage', label: 'City Mileage', value: specification.city_mileage },
    { key: 'highway_mileage', label: 'Highway Mileage', value: specification.highway_mileage },
    { key: 'peak_power', label: 'Peak Power', value: specification.peak_power },
    { key: 'fuel_capacity', label: 'Fuel Capacity', value: specification.fuel_capacity },
    { key: 'kerb_weight', label: 'Kerb Weight', value: specification.kerb_weight },
    { key: 'ground_clearance', label: 'Ground Clearance', value: specification.ground_clearance },
    { key: 'seat_height', label: 'Seat Height', value: specification.seat_height },
    { key: 'wheelbase', label: 'Wheelbase', value: specification.wheelbase },
    { key: 'front_brake', label: 'Front Brake', value: specification.front_brake },
    { key: 'rear_brake', label: 'Rear Brake', value: specification.rear_brake },
    { key: 'front_suspension', label: 'Front Suspension', value: specification.front_suspension },
    { key: 'rear_suspension', label: 'Rear Suspension', value: specification.rear_suspension },
    { key: 'front_tyre', label: 'Front Tyre', value: specification.front_tyre },
    { key: 'rear_tyre', label: 'Rear Tyre', value: specification.rear_tyre },
    { key: 'top_speed', label: 'Top Speed', value: specification.top_speed },
    { key: 'acceleration', label: 'Acceleration', value: specification.acceleration }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="View Specification" />
        
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
                    {specification.brand_name} {specification.model_name} {specification.variant_name}
                  </h1>
                  <p className="text-gray-600">Specification Details</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/specifications/${variantId}/edit`)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiEdit className="w-4 h-4 mr-2" />
                Edit Specification
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-medium text-gray-900">Specification Details</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specificationFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {field.value || '-'}
                      </div>
                    </div>
                  ))}
                </div>
                
                {specification.created_at && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Created At
                        </label>
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                          {new Date(specification.created_at).toLocaleString()}
                        </div>
                      </div>
                      {specification.updated_at && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Updated At
                          </label>
                          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                            {new Date(specification.updated_at).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}