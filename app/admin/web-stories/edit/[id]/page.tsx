'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { storageManager } from '@/utils/supabase-storage';

interface WebStoryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  pages: Array<{ image_url: string; caption?: string }>;
  author: string;
  category: string;
  featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export default function EditWebStoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [webStoryItem, setWebStoryItem] = useState<WebStoryItem | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('General');
  const [featured, setFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [pagesFiles, setPagesFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState('');
  const [currentPages, setCurrentPages] = useState<Array<{ image_url: string; caption?: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWebStoryItem();
    fetchFolders();
  }, [params.id]);

  const fetchWebStoryItem = async () => {
    try {
      const response = await fetch(`/api/admin/webstories/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        const item = data.data;
        setWebStoryItem(item);
        setTitle(item.title);
        setSlug(item.slug);
        setDescription(item.description || '');
        setAuthor(item.author);
        setCategory(item.category);
        setFeatured(item.featured);
        setIsPublished(item.is_published);
        setCurrentCoverUrl(item.cover_image_url || '');
        setCurrentPages(item.pages || []);
      } else {
        setError('Failed to fetch web story');
      }
    } catch (err) {
      setError('Error fetching web story');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    const { folders: storageFolders } = await storageManager.listImageFolders();
    setFolders(storageFolders.map(f => f.name));
  };

  const handlePagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPagesFiles(prev => [...prev, ...files]);
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
      let pages = [...currentPages];

      if (coverFile) {
        if (!selectedFolder) throw new Error('Select a folder for cover upload');
        const res = await storageManager.uploadFile(selectedFolder, coverFile.name, coverFile);
        if (!res.success) throw new Error(res.error || 'Cover upload failed');
        coverUrl = res.url || coverUrl;
      }

      // Upload new pages if any
      if (pagesFiles.length > 0) {
        if (!selectedFolder) throw new Error('Select a folder for pages upload');
        for (const file of pagesFiles) {
          const res = await storageManager.uploadFile(selectedFolder, file.name, file);
          if (!res.success) throw new Error(res.error || `Failed to upload ${file.name}`);
          pages.push({ image_url: res.url || '', caption: '' });
        }
      }

      const resp = await fetch(`/api/admin/webstories/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          slug, 
          cover_image_url: coverUrl, 
          pages,
          author,
          description,
          category,
          featured,
          is_published: isPublished
        })
      });

      const data = await resp.json();
      if (!data.success) {
        setError(data.error || 'Failed to update web story');
      } else {
        setSuccess(data.message || 'Web story updated successfully!');
        setCurrentCoverUrl(coverUrl);
        setCurrentPages(pages);
        setCoverFile(null);
        setPagesFiles([]);
        
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
          <p className="mt-4 text-gray-600">Loading web story...</p>
        </div>
      </div>
    );
  }

  if (!webStoryItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Web story not found</p>
          <button
            onClick={() => router.push('/admin/web-stories')}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Web Stories List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Web Stories Manager" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Edit Web Story</h1>
              <button
                onClick={() => router.push('/admin/web-stories')}
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
                  placeholder="Enter web story title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="web-story-slug-url" 
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Brief description of the web story..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
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
                  <option value="Buying Guide">Buying Guide</option>
                  <option value="Tips">Tips</option>
                  <option value="Comparison">Comparison</option>
                  <option value="Safety">Safety</option>
                  <option value="Performance">Performance</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
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
                <label className="block text-sm font-medium mb-1">Current Pages</label>
                {currentPages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {currentPages.map((page, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={page.image_url} 
                          alt={`Page ${index + 1}`} 
                          className="w-20 h-16 object-cover rounded border"
                        />
                        <span className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-br">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-600">{currentPages.length} pages</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select storage folder (for uploads)</label>
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
                  onChange={e => setCoverFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Add New Pages (optional - will be added after existing pages)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handlePagesSelect}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {pagesFiles.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">{pagesFiles.length} new files selected</p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={featured} 
                    onChange={e => setFeatured(e.target.checked)}
                    className="mr-2"
                  />
                  Featured Story
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
                  {uploading ? 'Updating...' : 'Update Web Story'}
                </button>
                
                <button 
                  onClick={() => router.push('/admin/web-stories')} 
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