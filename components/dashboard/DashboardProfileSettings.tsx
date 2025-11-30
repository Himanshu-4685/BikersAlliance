'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  FiUser, 
  FiCamera, 
  FiSave, 
  FiMail, 
  FiEdit2,
  FiUpload,
  FiX,
  FiCheck,
  FiLoader
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';

export default function DashboardProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(user?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('folder', 'Image/Profile_image');

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProfileImage(result.imageUrl);
        // Update user's avatar in auth context
        await updateProfile({ avatarUrl: result.imageUrl });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { success, error } = await updateProfile({
        fullName: formData.fullName,
        // Note: Email updates would typically require email verification
        // For now, we'll just update the display name
      });

      if (success) {
        setIsEditing(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError('');
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <FiCheck className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800">Profile updated successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <FiX className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="md:col-span-1">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-gray-200';
                        fallback.textContent = getInitials(displayName);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-gray-200">
                    {getInitials(displayName)}
                  </div>
                )}
                
                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50"
                  title="Change profile picture"
                >
                  {uploadingImage ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiCamera className="w-5 h-5" />
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <p className="text-sm text-gray-600 mb-2">
                Click the camera icon to upload a new photo
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG or GIF (max. 5MB)
              </p>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`block w-full pl-10 pr-4 py-3 border rounded-md focus:ring-primary focus:border-primary ${
                      isEditing 
                        ? 'border-gray-300 bg-white' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true} // Email updates require verification
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-md"
                    placeholder="your.email@example.com"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Email changes require verification and are not currently supported.
                </p>
              </div>

              {/* Account Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Account ID:</span>
                    <p className="text-gray-600 break-all">{user?.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Member Since:</span>
                    <p className="text-gray-600">
                      {new Date().toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center space-x-4 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <FiSave className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}