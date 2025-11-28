'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiFolderPlus, FiFolder, FiImage, FiUpload, FiTrash2, FiEye, FiStar } from 'react-icons/fi';
import { storageManager, StorageFolder, ImageWithUrl } from '@/utils/supabase-storage';

interface FolderView {
  name: string;
  imageCount: number;
  isSpecial?: boolean;
  specialType?: 'hero' | 'brand' | 'profile';
}

export default function AdminImagesPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [folders, setFolders] = useState<FolderView[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderImages, setFolderImages] = useState<ImageWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'folders' | 'images'>('folders');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, isLoading, router]);

  useEffect(() => {
    if (admin) {
      fetchFolders();
    }
  }, [admin]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { folders: storageFolders, error } = await storageManager.listImageFolders();
      
      if (error) {
        setError(error);
        setFolders([]);
        return;
      }

      // Process folders and get image counts
      const folderViews: FolderView[] = await Promise.all(
        storageFolders.map(async (folder) => {
          const { files } = await storageManager.listFolderFiles(folder.name);
          
          return {
            name: folder.name,
            imageCount: files.length,
            isSpecial: ['hero_section', 'Brand_image', 'Profile_image'].includes(folder.name),
            specialType: folder.name === 'hero_section' ? 'hero' : 
                        folder.name === 'Brand_image' ? 'brand' : 
                        folder.name === 'Profile_image' ? 'profile' : undefined
          };
        })
      );

      setFolders(folderViews);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError('Failed to load image folders');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderImages = async (folderName: string) => {
    try {
      setImagesLoading(true);
      const { images, error } = await storageManager.getFilesWithUrls(folderName);
      
      if (error) {
        setError(error);
        setFolderImages([]);
        return;
      }

      setFolderImages(images);
      setSelectedFolder(folderName);
      setView('images');
    } catch (error) {
      console.error('Error fetching folder images:', error);
      setError('Failed to load folder images');
    } finally {
      setImagesLoading(false);
    }
  };

  const handleDeleteImage = async (folderName: string, fileName: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { success, error } = await storageManager.deleteFile(folderName, fileName);
      
      if (success) {
        // Refresh the images in current folder
        await fetchFolderImages(folderName);
        
        // If this is hero_section, also refresh the homepage
        if (folderName === 'hero_section') {
          // Optionally trigger a refresh of the hero images API
          fetch('/api/hero-images', { method: 'GET' });
        }
      } else {
        alert(`Failed to delete image: ${error}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  const handleBackToFolders = () => {
    setView('folders');
    setSelectedFolder(null);
    setFolderImages([]);
  };

  const getSpecialFolderIcon = (folderType?: string) => {
    switch (folderType) {
      case 'hero':
        return <FiStar className="text-yellow-500" />;
      case 'brand':
        return <FiImage className="text-blue-500" />;
      case 'profile':
        return <FiEye className="text-green-500" />;
      default:
        return <FiFolder className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Images Management" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {view === 'folders' ? 'Image Storage Folders' : `${selectedFolder} Images`}
                </h1>
                <p className="text-gray-600">
                  {view === 'folders' 
                    ? 'Manage images organized by folders in your Supabase storage'
                    : `Manage images in the ${selectedFolder} folder`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {view === 'images' && (
                  <button
                    onClick={handleBackToFolders}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back to Folders
                  </button>
                )}
                <button
                  onClick={() => {
                    if (view === 'folders') {
                      router.push('/admin/images/upload');
                    } else {
                      router.push(`/admin/images/upload?folder=${selectedFolder}`);
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiUpload className="w-4 h-4 mr-2" />
                  {view === 'folders' ? 'Upload Images' : `Upload to ${selectedFolder}`}
                </button>
              </div>
            </div>

            {/* Search (only for images view) */}
            {view === 'images' && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    if (view === 'folders') {
                      fetchFolders();
                    } else if (selectedFolder) {
                      fetchFolderImages(selectedFolder);
                    }
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading folders...</div>
              </div>
            ) : view === 'folders' ? (
              /* Folders View */
              <div>
                {folders.length === 0 ? (
                  <div className="text-center py-12">
                    <FiFolder className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No folders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No image folders found in your Supabase storage.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {folders.map((folder) => (
                      <div
                        key={folder.name}
                        onClick={() => fetchFolderImages(folder.name)}
                        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {getSpecialFolderIcon(folder.specialType)}
                              <h3 className="text-lg font-medium text-gray-900">
                                {folder.name.replace(/_/g, ' ')}
                              </h3>
                            </div>
                            {folder.isSpecial && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Special
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{folder.imageCount} images</span>
                            {folder.specialType === 'hero' && (
                              <span className="text-yellow-600 font-medium">
                                Homepage Carousel
                              </span>
                            )}
                          </div>
                          
                          {folder.specialType === 'hero' && (
                            <p className="mt-2 text-xs text-gray-600">
                              Images here control the homepage hero carousel
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Images View */
              <div>
                {imagesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading images...</div>
                  </div>
                ) : folderImages.length === 0 ? (
                  <div className="text-center py-12">
                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This folder doesn't contain any images yet.
                    </p>
                    <button
                      onClick={() => router.push(`/admin/images/upload?folder=${selectedFolder}`)}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiUpload className="w-4 h-4 mr-2" />
                      Upload Images
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Special folder notice */}
                    {selectedFolder === 'hero_section' && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <FiStar className="w-5 h-5 text-yellow-600 mr-2" />
                          <h4 className="text-sm font-medium text-yellow-800">
                            Hero Section Images
                          </h4>
                        </div>
                        <p className="mt-1 text-sm text-yellow-700">
                          These images appear in the homepage carousel. Changes here will be reflected on the homepage automatically.
                        </p>
                      </div>
                    )}

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {folderImages
                        .filter(image => 
                          searchTerm === '' || 
                          image.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((image) => (
                        <div key={image.name} className="bg-white rounded-lg shadow overflow-hidden group">
                          <div className="aspect-square relative">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(image.url, '_blank');
                                  }}
                                  className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                  title="View Full Size"
                                >
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(selectedFolder!, image.name);
                                  }}
                                  className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium text-gray-900 truncate" title={image.name}>
                              {image.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {image.updated_at ? new Date(image.updated_at).toLocaleDateString() : 'Recently uploaded'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}