'use client';

import { useState } from 'react';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';

interface ImageUploadProps {
  variantId?: string;
  currentImageUrl?: string;
  onImageUploaded?: (imageUrl: string) => void;
  disabled?: boolean;
}

export default function VariantImageUpload({ 
  variantId, 
  currentImageUrl, 
  onImageUploaded, 
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !variantId) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('variantId', variantId);

      const response = await fetch('/api/admin/variants/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setImageUrl(result.imageUrl);
        setPreviewUrl(result.imageUrl);
        onImageUploaded?.(result.imageUrl);
      } else {
        alert(result.error || 'Failed to upload image');
        setPreviewUrl(currentImageUrl || null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setPreviewUrl(null);
    onImageUploaded?.('');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Variant Image
      </label>
      
      {previewUrl ? (
        <div className="relative group">
          <div className="w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <img
              src={previewUrl}
              alt="Variant preview"
              className="w-full h-full object-cover"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No image uploaded</p>
          </div>
        </div>
      )}

      {!disabled && (
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || !variantId}
            />
            <span className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border ${
              uploading || !variantId
                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}>
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4 mr-2" />
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </>
              )}
            </span>
          </label>
          
          {!variantId && (
            <p className="text-xs text-gray-500">
              Save the variant first to upload an image
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Supported formats: JPEG, PNG, WebP, AVIF. Maximum size: 5MB.
      </p>
    </div>
  );
}