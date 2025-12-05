'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiSave, FiArrowLeft, FiUpload } from 'react-icons/fi';
import { storageManager } from '@/utils/supabase-storage';

interface BrandFormData {
  brand_name: string;
  logo_url: string;
  country: string;
  description: string;
}

export default function NewBrandPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<BrandFormData>({
    brand_name: '',
    logo_url: '',
    country: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo_url: 'Please select an image file' }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo_url: 'File size must be less than 5MB' }));
      return;
    }

    try {
      setUploading(true);
      setErrors(prev => ({ ...prev, logo_url: '' }));

      // Ensure Brand_image folder exists
      try {
        const { folders } = await storageManager.listImageFolders();
        const brandFolderExists = folders.some(folder => folder.name === 'Brand_image');
        
        if (!brandFolderExists) {
          console.log('Creating Brand_image folder...');
          await storageManager.createFolder('Brand_image');
        }
      } catch (folderError) {
        console.warn('Could not ensure folder exists:', folderError);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanBrandName = formData.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
      const fileName = `${cleanBrandName}_${timestamp}.${extension}`;

      // Upload to Brand_image folder
      const result = await storageManager.uploadFile('Brand_image', fileName, file);

      if (result.success && result.url) {
        console.log('Upload successful. URL:', result.url);
        // Update form data with the uploaded URL
        setFormData(prev => ({
          ...prev,
          logo_url: result.url
        }));
      } else {
        console.error('Upload failed:', result.error);
        setErrors(prev => ({ ...prev, logo_url: result.error || 'Upload failed' }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, logo_url: 'Upload failed. Please try again.' }));
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand_name.trim()) {
      newErrors.brand_name = 'Brand name is required';
    }
    
    if (formData.logo_url && !isValidUrl(formData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/brands', {
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
            table_name: 'brands',
            record_id: result.brand.brand_id
          })
        });

        router.push('/admin/brands');
      } else {
        alert(result.error || 'Failed to create brand');
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      alert('Error creating brand');
    } finally {
      setSaving(false);
    }
  };

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

  const countries = [
    'India', 'Japan', 'Germany', 'Italy', 'United States', 'United Kingdom',
    'France', 'Austria', 'China', 'South Korea', 'Taiwan', 'Brazil',
    'Canada', 'Sweden', 'Spain', 'Netherlands'
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Add New Brand" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/brands')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add New Brand</h1>
                  <p className="text-gray-600 mt-1">Create a new motorcycle brand</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Brand Name */}
                <div>
                  <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    id="brand_name"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.brand_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter brand name"
                    required
                  />
                  {errors.brand_name && <p className="mt-1 text-sm text-red-600">{errors.brand_name}</p>}
                </div>

                {/* Logo URL */}
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                    <span className="text-xs text-gray-500 ml-2">(Enter URL or upload an image)</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      id="logo_url"
                      name="logo_url"
                      value={formData.logo_url}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.logo_url ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com/logo.png or upload an image"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={uploading || !formData.brand_name.trim()}
                      className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                        uploading || !formData.brand_name.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <FiUpload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                  </div>
                  {errors.logo_url && <p className="mt-1 text-sm text-red-600">{errors.logo_url}</p>}
                  {!formData.brand_name.trim() && (
                    <p className="mt-1 text-xs text-gray-500">Enter brand name first to enable image upload</p>
                  )}
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        className="w-16 h-16 object-contain border rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter brand description"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/brands')}
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
                        <span>Create Brand</span>
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