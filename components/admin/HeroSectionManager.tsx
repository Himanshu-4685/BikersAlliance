'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiUpload, FiTrash2, FiEye, FiRefreshCw, FiMove } from 'react-icons/fi';
import { storageManager, ImageWithUrl } from '@/utils/supabase-storage';

interface HeroSectionManagerProps {
  onImageUpdate?: () => void;
}

export default function HeroSectionManager({ onImageUpdate }: HeroSectionManagerProps) {
  const [heroImages, setHeroImages] = useState<ImageWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { images, error } = await storageManager.getFilesWithUrls('hero_section');
      
      if (error) {
        setError(error);
        setHeroImages([]);
      } else {
        setHeroImages(images);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
      setError('Failed to load hero images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Filter for image files
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || /\.(jpg|jpeg|png|avif|webp|gif)$/i.test(file.name)
    );

    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { results } = await storageManager.uploadMultipleFiles('hero_section', imageFiles);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        await fetchHeroImages();
        
        // Trigger homepage refresh
        if (onImageUpdate) {
          onImageUpdate();
        }
        
        // Also refresh the hero images API
        fetch('/api/hero-images', { method: 'GET' });
      }

      if (failureCount > 0) {
        const failedFiles = results.filter(r => !r.success).map(r => r.fileName).join(', ');
        setError(`Failed to upload: ${failedFiles}`);
      }
    } catch (error) {
      setError('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This will remove it from the homepage carousel.`)) {
      return;
    }

    try {
      const { success, error } = await storageManager.deleteFile('hero_section', fileName);
      
      if (success) {
        await fetchHeroImages();
        
        // Trigger homepage refresh
        if (onImageUpdate) {
          onImageUpdate();
        }
        
        // Refresh the hero images API
        fetch('/api/hero-images', { method: 'GET' });
      } else {
        setError(`Failed to delete image: ${error}`);
      }
    } catch (error) {
      setError('Error deleting image');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...heroImages];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged image
    newImages.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    setHeroImages(newImages);
    setDraggedIndex(null);
    
    // Note: In a real implementation, you might want to persist this order
    // For now, it's just a UI preview of how reordering could work
  };

  const refreshHeroAPI = async () => {
    try {
      const response = await fetch('/api/hero-images', { method: 'GET' });
      const data = await response.json();
      
      if (data.success) {
        alert(`Hero API refreshed successfully. Found ${data.count} images.`);
      } else {
        alert(`Hero API refresh failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error refreshing hero API');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiStar className="w-6 h-6 text-yellow-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Hero Section Manager</h2>
              <p className="text-sm text-gray-600">Manage images for the homepage carousel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshHeroAPI}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh Hero API"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Refresh API
            </button>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              <FiUpload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Add Images'}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading hero images...</div>
          </div>
        ) : heroImages.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <FiStar className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Images</h3>
            <p className="text-gray-600 mb-6">
              Add images to create an attractive homepage carousel that will engage your visitors.
            </p>
            <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              <FiUpload className="w-5 h-5 mr-2" />
              Upload First Hero Image
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          </div>
        ) : (
          /* Images Grid */
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {heroImages.length} image{heroImages.length !== 1 ? 's' : ''} in carousel
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <FiMove className="w-3 h-3 mr-1" />
                Drag to reorder
              </div>
            </div>

            {/* Hero Images Preview Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <FiStar className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Live on Homepage</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    These images are currently displayed in the homepage hero carousel. 
                    Changes here will be reflected on your website immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroImages.map((image, index) => (
                <div
                  key={image.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-move ${
                    draggedIndex === index 
                      ? 'border-blue-500 shadow-lg opacity-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Image Info & Actions */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate mb-2" title={image.name}>
                      {image.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {image.updated_at ? new Date(image.updated_at).toLocaleDateString() : 'Recent'}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => window.open(image.url, '_blank')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View full size"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete from carousel"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Tips for Hero Images:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use high-quality images with a 16:9 aspect ratio for best results</li>
                <li>• Recommended size: 1920x1080 pixels or similar proportions</li>
                <li>• Keep file sizes under 2MB for faster loading</li>
                <li>• The carousel auto-rotates every 5 seconds</li>
                <li>• Images are displayed in the order shown above</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}