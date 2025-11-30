'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { storageManager } from '@/utils/supabase-storage';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author: string;
  category: string;
  featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [author, setAuthor] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchNewsItem();
    fetchFolders();
  }, [params.id]);

  const fetchNewsItem = async () => {
    try {
      const response = await fetch(`/api/admin/news/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        const item = data.data;
        setNewsItem(item);
        setTitle(item.title);
        setSlug(item.slug);
        setExcerpt(item.excerpt || '');
        setContent(item.content || '');
        setCategory(item.category);
        setAuthor(item.author);
        setFeatured(item.featured);
        setIsPublished(item.is_published);
        setCurrentCoverUrl(item.cover_image_url || '');
      } else {
        setError('Failed to fetch news item');
      }
    } catch (err) {
      setError('Error fetching news item');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    const { folders: storageFolders } = await storageManager.listImageFolders();
    setFolders(storageFolders.map(f => f.name));
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
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
      let coverUrl = currentCoverUrl;

      if (coverFile) {
        if (!selectedFolder) {
          setError('Select or create a folder to upload the cover image');
          setUploading(false);
          return;
        }

        const { success, url, error } = await storageManager.uploadFile(selectedFolder, coverFile.name, coverFile);
        if (!success) throw new Error(error || 'Upload failed');
        coverUrl = url || coverUrl;
      }

      const resp = await fetch(`/api/admin/news/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          slug, 
          excerpt, 
          content, 
          cover_image_url: coverUrl,
          author,
          category,
          featured,
          is_published: isPublished
        })
      });

      const data = await resp.json();
      if (!data.success) {
        setError(data.error || 'Failed to update news');
      } else {
        setSuccess(data.message || 'News updated successfully!');
        setCurrentCoverUrl(coverUrl);
        setCoverFile(null);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
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
          <p className="mt-4 text-gray-600">Loading news item...</p>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">News item not found</p>
          <button
            onClick={() => router.push('/admin/news')}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to News List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="News Manager" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Edit News Item</h1>
              <button
                onClick={() => router.push('/admin/news')}
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
                  placeholder="Enter news title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="news-slug-url" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Author name" 
                  value={author} 
                  onChange={e => setAuthor(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Brief description of the news..." 
                  value={excerpt} 
                  onChange={e => setExcerpt(e.target.value)} 
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Launches">Launches</option>
                  <option value="Reviews">Reviews</option>
                  <option value="Industry">Industry</option>
                  <option value="Updates">Updates</option>
                  <option value="Electric">Electric</option>
                  <option value="Scooters">Scooters</option>
                  <option value="Motorcycles">Motorcycles</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Full news content (HTML or markdown)" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Current Cover Image</label>
                {currentCoverUrl && (
                  <div className="mb-2">
                    <img 
                      src={currentCoverUrl} 
                      alt="Current cover" 
                      className="w-32 h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select storage folder (for new cover image)</label>
                <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                  <option value="">Select folder...</option>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Cover Image (optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverSelect}
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
                  Featured Article
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
                  {uploading ? 'Updating...' : 'Update News'}
                </button>
                
                <button 
                  onClick={() => router.push('/admin/news')} 
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