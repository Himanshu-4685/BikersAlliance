'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { storageManager } from '@/utils/supabase-storage';

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

export default function EditVideoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [videoItem, setVideoItem] = useState<VideoItem | null>(null);
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
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoItem();
    fetchFolders();
  }, [params.id]);

  const fetchVideoItem = async () => {
    try {
      const response = await fetch(`/api/admin/videos/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        const item = data.data;
        setVideoItem(item);
        setTitle(item.title);
        setSlug(item.slug);
        setDescription(item.description || '');
        setVideoUrl(item.video_url || '');
        setSource(item.source);
        setCategory(item.category);
        setFeatured(item.featured);
        setDuration(item.duration || '');
        setIsPublished(item.is_published);
        setCurrentThumbnailUrl(item.thumbnail_url || '');
      } else {
        setError('Failed to fetch video');
      }
    } catch (err) {
      setError('Error fetching video');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    const { folders: storageFolders } = await storageManager.listImageFolders();
    setFolders(storageFolders.map(f => f.name));
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
      let finalVideoUrl = videoUrl;
      let thumbnailUrl = currentThumbnailUrl;

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
        thumbnailUrl = res.url || thumbnailUrl;
      }

      const resp = await fetch(`/api/admin/videos/${params.id}`, {
        method: 'PATCH',
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
        setError(data.error || 'Failed to update video');
      } else {
        setSuccess(data.message || 'Video updated successfully!');
        setVideoUrl(finalVideoUrl);
        setCurrentThumbnailUrl(thumbnailUrl);
        setVideoFile(null);
        setThumbnailFile(null);
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => input.value = '');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!videoItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Video not found</p>
          <button
            onClick={() => router.push('/admin/videos')}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Videos List
          </button>
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Edit Video</h1>
              <button
                onClick={() => router.push('/admin/videos')}
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
                  onChange={e => setTitle(e.target.value)} 
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
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., 12:45" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="https://youtube.com/watch?v=..." 
                  value={videoUrl} 
                  onChange={e => setVideoUrl(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Current Thumbnail</label>
                {currentThumbnailUrl && (
                  <div className="mb-2">
                    <img 
                      src={currentThumbnailUrl} 
                      alt="Current thumbnail" 
                      className="w-32 h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select storage folder (for file uploads)</label>
                <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                  <option value="">Select folder...</option>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New video file (optional)</label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={e => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New thumbnail (optional)</label>
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
                  {uploading ? 'Updating...' : 'Update Video'}
                </button>
                
                <button 
                  onClick={() => router.push('/admin/videos')} 
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