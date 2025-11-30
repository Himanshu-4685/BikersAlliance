'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiUpload, FiX, FiLoader, FiSave, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';

const bikeCategories = [
  'Motorcycle', 'Scooter', 'Sports Bike', 'Cruiser', 'Touring', 'Adventure', 'Electric'
];

const fuelTypes = [
  'Petrol', 'Electric', 'CNG', 'Diesel'
];

const transmissionTypes = [
  'Manual', 'Automatic', 'CVT'
];

const ownershipTypes = [
  'First Owner', 'Second Owner', 'Third Owner', 'Fourth Owner or More'
];

const conditionTypes = [
  'Excellent', 'Good', 'Fair'
];

const indianStates = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Other'
];

export default function AddUsedBikePage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    variant: '',
    year: '',
    category: '',
    fuelType: '',
    transmission: '',
    kmDriven: '',
    ownership: '',
    expectedPrice: '',
    condition: '',
    description: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    hasRC: false,
    hasInsurance: false,
    hasPUC: false,
    photos: [] as string[]
  });

  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (isLoading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 10) {
      setSubmitError('You can upload maximum 10 photos');
      return;
    }

    setIsUploading(true);
    setSubmitError('');

    try {
      const formDataUpload = new FormData();
      files.forEach(file => {
        formDataUpload.append('files', file);
      });

      const response = await fetch('/api/upload/sell-bike-images', {
        method: 'POST',
        body: formDataUpload
      });

      const result = await response.json();

      if (result.success) {
        const newImages = result.data.map((item: any) => ({
          url: item.url,
          path: item.path,
          fileName: item.fileName
        }));
        
        setUploadedImages(prev => [...prev, ...newImages]);
        setFormData(prev => ({ 
          ...prev, 
          photos: [...prev.photos, ...newImages.map((img: any) => img.url)] 
        }));
      } else {
        setSubmitError(result.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSubmitError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    
    try {
      await fetch(`/api/upload/sell-bike-images?path=${encodeURIComponent(imageToRemove.path)}`, {
        method: 'DELETE'
      });

      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      setFormData(prev => ({
        ...prev,
        photos: newImages.map(img => img.url)
      }));
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/sell-bike', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'approved' // Admin added bikes are auto-approved
        })
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/used-bikes');
      } else {
        setSubmitError(result.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Add New Used Bike" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Used Bike Listing</h1>
                <p className="text-gray-600">Create a new used bike listing for the marketplace</p>
              </div>
              <button
                onClick={() => router.push('/admin/used-bikes')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Bike Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bike Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="e.g., Honda, Hero, TVS"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="e.g., Activa 6G"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Variant</label>
                      <input
                        type="text"
                        name="variant"
                        value={formData.variant}
                        onChange={handleInputChange}
                        placeholder="e.g., Standard, Deluxe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {bikeCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
                      <select
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Fuel Type</option>
                        {fuelTypes.map(fuel => (
                          <option key={fuel} value={fuel}>{fuel}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transmission *</label>
                      <select
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Transmission</option>
                        {transmissionTypes.map(trans => (
                          <option key={trans} value={trans}>{trans}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">KM Driven *</label>
                      <input
                        type="number"
                        name="kmDriven"
                        value={formData.kmDriven}
                        onChange={handleInputChange}
                        placeholder="e.g., 15000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Condition & Pricing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Condition & Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ownership *</label>
                      <select
                        name="ownership"
                        value={formData.ownership}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Ownership</option>
                        {ownershipTypes.map(owner => (
                          <option key={owner} value={owner}>{owner}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price (₹) *</label>
                      <input
                        type="number"
                        name="expectedPrice"
                        value={formData.expectedPrice}
                        onChange={handleInputChange}
                        placeholder="e.g., 65000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {conditionTypes.map((cond) => (
                          <label key={cond} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="condition"
                              value={cond}
                              checked={formData.condition === cond}
                              onChange={handleInputChange}
                              className="mr-3 text-indigo-500 focus:ring-indigo-500"
                            />
                            <div>
                              <div className="font-medium">{cond}</div>
                              <div className="text-sm text-gray-600">
                                {cond === 'Excellent' && 'Like new, minimal wear'}
                                {cond === 'Good' && 'Well maintained, some wear'}
                                {cond === 'Fair' && 'Functional, visible wear'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe the bike's condition, modifications, or additional details..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Owner/Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="owner@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Mumbai"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-gray-700">Available Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="hasRC"
                          checked={formData.hasRC}
                          onChange={handleInputChange}
                          className="mr-3 text-indigo-500 focus:ring-indigo-500"
                        />
                        Registration Certificate (RC)
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="hasInsurance"
                          checked={formData.hasInsurance}
                          onChange={handleInputChange}
                          className="mr-3 text-indigo-500 focus:ring-indigo-500"
                        />
                        Valid Insurance
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="hasPUC"
                          checked={formData.hasPUC}
                          onChange={handleInputChange}
                          className="mr-3 text-indigo-500 focus:ring-indigo-500"
                        />
                        PUC Certificate
                      </label>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Photos</h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Bike Photos</h4>
                    <p className="text-gray-600 mb-4">
                      Add up to 10 photos. Include front, side, rear views and any damages.
                    </p>
                    <label className={`inline-flex items-center px-6 py-3 rounded-lg cursor-pointer transition-colors ${
                      isUploading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } text-white`}>
                      {isUploading ? (
                        <>
                          <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4 mr-2" />
                          Choose Photos
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploading || uploadedImages.length >= 10}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      {uploadedImages.length}/10 photos uploaded
                    </p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Uploaded Photos ({uploadedImages.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={image.url}
                                alt={`Bike photo ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{submitError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/used-bikes')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FiSave className="w-4 h-4 mr-2" />
                        Create Listing
                      </div>
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