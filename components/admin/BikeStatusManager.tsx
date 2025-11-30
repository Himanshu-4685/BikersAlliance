'use client';

import { useState, useEffect } from 'react';
import { BikeStatus, BikeStatusFormData } from '@/types/bike-status';

interface BikeStatusManagerProps {
  onStatusChange?: () => void;
}

export default function BikeStatusManager({ onStatusChange }: BikeStatusManagerProps) {
  const [bikes, setBikes] = useState<BikeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState<BikeStatus | null>(null);
  const [formData, setFormData] = useState<BikeStatusFormData>({
    brand_id: '',
    model_id: 0,
    variant_id: 0,
    status: 'upcoming',
    price_range: '',
    expected_launch: '',
    launch_date: ''
  });

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bike-status');
      const data = await response.json();
      
      if (data.success) {
        setBikes(data.data);
      }
    } catch (error) {
      console.error('Error fetching bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingBike ? 'PUT' : 'POST';
      const url = editingBike 
        ? `/api/bike-status/${editingBike.id}` 
        : '/api/bike-status';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchBikes();
        resetForm();
        onStatusChange?.();
      }
    } catch (error) {
      console.error('Error saving bike status:', error);
    }
  };

  const handleEdit = (bike: BikeStatus) => {
    setEditingBike(bike);
    setFormData({
      brand_id: bike.brand.id,
      model_id: bike.model.id,
      variant_id: bike.variant.id,
      status: bike.status,
      price_range: bike.priceRange,
      expected_launch: bike.expectedLaunch || '',
      launch_date: bike.launchDate || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this bike status?')) {
      try {
        const response = await fetch(`/api/bike-status/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchBikes();
          onStatusChange?.();
        }
      } catch (error) {
        console.error('Error deleting bike status:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      brand_id: '',
      model_id: 0,
      variant_id: 0,
      status: 'upcoming',
      price_range: '',
      expected_launch: '',
      launch_date: ''
    });
    setEditingBike(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bike Status Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Add New Status
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingBike ? 'Edit' : 'Add'} Bike Status
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand ID</label>
                <input
                  type="text"
                  value={formData.brand_id}
                  onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Model ID</label>
                <input
                  type="number"
                  value={formData.model_id}
                  onChange={(e) => setFormData({...formData, model_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Variant ID</label>
                <input
                  type="number"
                  value={formData.variant_id}
                  onChange={(e) => setFormData({...formData, variant_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'upcoming' | 'new_launch'})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="new_launch">New Launch</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price Range</label>
                <input
                  type="text"
                  value={formData.price_range}
                  onChange={(e) => setFormData({...formData, price_range: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 2.77 - 3.20 Lakh"
                  required
                />
              </div>
              
              {formData.status === 'upcoming' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Launch</label>
                  <input
                    type="date"
                    value={formData.expected_launch}
                    onChange={(e) => setFormData({...formData, expected_launch: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              )}
              
              {formData.status === 'new_launch' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Launch Date</label>
                  <input
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) => setFormData({...formData, launch_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              )}
              
              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  {editingBike ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bikes Table */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Bike</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Price Range</th>
              <th className="px-4 py-3 text-left">Launch Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bikes.map((bike) => (
              <tr key={bike.id} className="border-t">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">
                      {bike.brand.name} {bike.model.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bike.variant.name}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bike.status === 'upcoming' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {bike.status === 'upcoming' ? 'Upcoming' : 'New Launch'}
                  </span>
                </td>
                <td className="px-4 py-3">₹ {bike.priceRange}</td>
                <td className="px-4 py-3">
                  {bike.status === 'upcoming' 
                    ? bike.expectedLaunch 
                    : bike.launchDate
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(bike)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bike.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}