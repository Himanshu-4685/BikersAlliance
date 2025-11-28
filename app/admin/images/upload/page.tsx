'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { FiUpload, FiX, FiCheck, FiAlertCircle, FiFolder } from 'react-icons/fi';
import { storageManager } from '@/utils/supabase-storage';

interface UploadResult {
  fileName: string;
  success: boolean;
  url?: string;
  error?: string;
}

export default function AdminImageUploadPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFolder = searchParams.get('folder') || '';

  const [selectedFolder, setSelectedFolder] = useState(initialFolder);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
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
      const { folders: storageFolders } = await storageManager.listImageFolders();
      setFolders(storageFolders.map(f => f.name));
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      return file.type.startsWith('image/') || /\.(jpg|jpeg|png|avif|webp|gif|svg)$/i.test(file.name);
    });
    
    if (imageFiles.length !== files.length) {
      setError('Some files were filtered out. Only image files are allowed.');
    } else {
      setError(null);
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    const folderName = newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    
    try {
      const { success, error } = await storageManager.createFolder(folderName);
      
      if (success) {
        setFolders(prev => [...prev, folderName]);
        setSelectedFolder(folderName);
        setNewFolderName('');
        setShowNewFolderInput(false);
        setError(null);
      } else {
        setError(`Failed to create folder: ${error}`);
      }
    } catch (error) {
      setError('Error creating folder');
    }
  };

  const uploadFiles = async () => {
    if (!selectedFolder) {
      setError('Please select a folder');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadResults([]);
    setError(null);

    try {
      const { results } = await storageManager.uploadMultipleFiles(selectedFolder, selectedFiles);
      setUploadResults(results);
      
      // Clear selected files on successful upload
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        setSelectedFiles([]);
        
        // If uploading to hero_section, refresh the hero images API
        if (selectedFolder === 'hero_section') {
          fetch('/api/hero-images', { method: 'GET' });
        }
      }
    } catch (error) {
      setError('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <AdminHeader title="Upload Images" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Images</h1>
                <p className="text-gray-600">Upload images to your Supabase storage folders</p>
              </div>
              <button
                onClick={() => router.push('/admin/images')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Images
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Folder Selection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Destination Folder</h2>
              
              <div className="space-y-4">
                {/* Existing Folders */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose existing folder:
                  </label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a folder...</option>
                    {folders.map(folder => (
                      <option key={folder} value={folder}>
                        {folder.replace(/_/g, ' ')} 
                        {folder === 'hero_section' && ' (Homepage Carousel)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* New Folder */}
                <div className="border-t pt-4">
                  {!showNewFolderInput ? (
                    <button
                      onClick={() => setShowNewFolderInput(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <FiFolder className="w-4 h-4 mr-2" />
                      Create new folder
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={createNewFolder}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowNewFolderInput(false);
                          setNewFolderName('');
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Selection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Images</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Choose files or drag and drop
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, AVIF, WebP up to 10MB each
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <button
                onClick={uploadFiles}
                disabled={uploading || !selectedFolder || selectedFiles.length === 0}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="w-5 h-5 mr-2" />
                    Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} to {selectedFolder}
                  </>
                )}
              </button>
            </div>

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h2>
                <div className="space-y-2">
                  {uploadResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        result.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {result.success ? (
                          <FiCheck className="text-green-600" />
                        ) : (
                          <FiX className="text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
                          {result.error && (
                            <p className="text-xs text-red-600">{result.error}</p>
                          )}
                        </div>
                      </div>
                      {result.success && result.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}