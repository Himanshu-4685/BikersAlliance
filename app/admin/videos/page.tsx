'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { storageManager } from '@/utils/supabase-storage';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiSearch, FiPlay } from 'react-icons/fi';

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  source: string;
  category: string;
  featured: boolean;
  duration: string;
  is_published: boolean;
  views: string;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export default function AdminVideosPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create form states
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [source, setSource] = useState('YouTube');
  const [category, setCategory] = useState('General');
  const [featured, setFeatured] = useState(false);
  const [duration, setDuration] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug.endsWith('-' + Date.now().toString().slice(-4))) {
      setSlug(generateSlug(value));
    }
  };

  useEffect(() => {
    fetchVideoItems();
    fetchFolders();
  }, []);

  const fetchVideoItems = async () => {
    try {
      const response = await fetch('/api/admin/videos');
      const data = await response.json();
      if (data.success) {
        setVideoItems(data.data);
      } else {
        setError('Failed to fetch videos');
      }
    } catch (err) {
      setError('Error fetching videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    const { folders: storageFolders } = await storageManager.listImageFolders();
    setFolders(storageFolders.map(f => f.name));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Video deleted successfully!');
        fetchVideoItems(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete video');
      }
    } catch (err) {
      setError('Error deleting video');
    }
  };

  const handleSubmit = async () => {
    if (!title || !slug) {
      setError('Title and slug are required');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      let finalVideoUrl = videoUrl || null;
      let thumbnailUrl = null;

      if (videoFile) {
        if (!selectedFolder) throw new Error('Select a folder for video upload');
        const res = await storageManager.uploadFile(selectedFolder, videoFile.name, videoFile);
        if (!res.success) throw new Error(res.error || 'Video upload failed');
        finalVideoUrl = res.url || finalVideoUrl;
      }

      if (thumbnailFile) {
        if (!selectedFolder) throw new Error('Select a folder for thumbnail upload');
        const res = await storageManager.uploadFile(selectedFolder, thumbnailFile.name, thumbnailFile);
        if (!res.success) throw new Error(res.error || 'Thumbnail upload failed');
        thumbnailUrl = res.url;
      }

      const resp = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          slug, 
          description, 
          video_url: finalVideoUrl, 
          thumbnail_url: thumbnailUrl,
          source,
          category,
          featured,
          duration,
          is_published: isPublished
        })
      });

      const data = await resp.json();
      if (!data.success) {
        setError(data.error || 'Failed to create video');
      } else {
        setSuccess(data.message || 'Video created successfully!');
        // Clear form
        setTitle('');
        setSlug('');
        setDescription('');
        setVideoUrl('');
        setSource('YouTube');
        setCategory('General');
        setFeatured(false);
        setDuration('');
        setIsPublished(true);
        setVideoFile(null);
        setThumbnailFile(null);
        setSelectedFolder('');
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => input.value = '');
        
        // Refresh the list and go back to list view
        fetchVideoItems();
        setView('list');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setUploading(false);
    }
  };

  // Filter video items based on search term
  const filteredVideoItems = videoItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'create') {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader title="Videos Manager" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Create Video</h1>
                <button
                  onClick={() => setView('list')}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  ← Back to List
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <strong>Success:</strong> {success}
                </div>
              )}

              <div className="bg-white rounded-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter video title" 
                    value={title} 
                    onChange={e => handleTitleChange(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="video-slug-url" 
                    value={slug} 
                    onChange={e => setSlug(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Video description..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Source</label>
                  <select 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={source} 
                    onChange={e => setSource(e.target.value)}
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Vimeo">Vimeo</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Reviews">Reviews</option>
                    <option value="Comparisons">Comparisons</option>
                    <option value="Tests">Tests</option>
                    <option value="First Rides">First Rides</option>
                    <option value="Tips">Tips</option>
                    <option value="Buying Guide">Buying Guide</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (optional)</label>
                  <input 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g., 12:45" 
                    value={duration} 
                    onChange={e => setDuration(e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Video URL (YouTube, Vimeo, or external)</label>
                  <input 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={videoUrl} 
                    onChange={e => setVideoUrl(e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Select storage folder (for file uploads)</label>
                  <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                    <option value="">Select folder...</option>
                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Or upload video file</label>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail (optional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={featured} 
                      onChange={e => setFeatured(e.target.checked)}
                      className="mr-2"
                    />
                    Featured Video
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={isPublished} 
                      onChange={e => setIsPublished(e.target.checked)}
                      className="mr-2"
                    />
                    Published
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={handleSubmit} 
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={uploading}
                  >
                    {uploading ? 'Creating...' : 'Create Video'}
                  </button>
                  
                  <button 
                    onClick={() => setView('list')} 
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Videos Manager" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Video Management</h1>
              <button
                onClick={() => setView('create')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Create Video
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <strong>Success:</strong> {success}
              </div>
            )}

            {/* Search and filters */}
            <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search videos by title, category, or source..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Videos list */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading videos...</p>
                </div>
              ) : filteredVideoItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No videos found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Video
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source & Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVideoItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                                {item.thumbnail_url ? (
                                  <img 
                                    src={item.thumbnail_url} 
                                    alt={item.title}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <FiPlay className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {item.title}
                                </h3>
                                {item.description && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2 mt-1">
                                  {item.featured && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <p>{item.source}</p>
                              <p className="text-gray-500">{item.duration}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{item.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.is_published 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => router.push(`/videos/${item.slug}`)}
                                className="text-gray-400 hover:text-gray-600"
                                title="View"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/videos/edit/${item.id}`)}
                                className="text-blue-400 hover:text-blue-600"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-400 hover:text-red-600"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
