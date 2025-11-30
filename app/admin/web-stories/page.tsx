'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { storageManager } from '@/utils/supabase-storage';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiSearch, FiBook } from 'react-icons/fi';

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

export default function AdminWebStoriesPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [webStoryItems, setWebStoryItems] = useState<WebStoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create form states
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('BikersAlliance Editorial');
  const [category, setCategory] = useState('General');
  const [featured, setFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [pagesFiles, setPagesFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
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
    fetchWebStoryItems();
    fetchFolders();
  }, []);

  const fetchWebStoryItems = async () => {
    try {
      const response = await fetch('/api/admin/webstories');
      const data = await response.json();
      if (data.success) {
        setWebStoryItems(data.data);
      } else {
        setError('Failed to fetch web stories');
      }
    } catch (err) {
      setError('Error fetching web stories');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    const { folders: storageFolders } = await storageManager.listImageFolders();
    setFolders(storageFolders.map(f => f.name));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this web story?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/webstories/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Web story deleted successfully!');
        fetchWebStoryItems(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete web story');
      }
    } catch (err) {
      setError('Error deleting web story');
    }
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

    if (!selectedFolder && (coverFile || pagesFiles.length > 0)) {
      setError('Select a storage folder first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      let coverUrl: string | null = null;
      const pages: Array<{ image_url: string; caption?: string }> = [];

      if (coverFile) {
        const res = await storageManager.uploadFile(selectedFolder, coverFile.name, coverFile);
        if (!res.success) throw new Error(res.error || 'Cover upload failed');
        coverUrl = res.url || null;
      }

      for (const file of pagesFiles) {
        const res = await storageManager.uploadFile(selectedFolder, file.name, file);
        if (!res.success) throw new Error(res.error || `Failed to upload ${file.name}`);
        pages.push({ image_url: res.url || '', caption: '' });
      }

      const resp = await fetch('/api/admin/webstories', {
        method: 'POST',
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
        setError(data.error || 'Failed to create web story');
      } else {
        setSuccess(data.message || 'Web story created successfully!');
        // Clear form
        setTitle('');
        setSlug('');
        setDescription('');
        setAuthor('BikersAlliance Editorial');
        setCategory('General');
        setFeatured(false);
        setIsPublished(true);
        setCoverFile(null);
        setPagesFiles([]);
        setSelectedFolder('');
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => input.value = '');
        
        // Refresh the list and go back to list view
        fetchWebStoryItems();
        setView('list');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setUploading(false);
    }
  };

  // Filter web story items based on search term
  const filteredWebStoryItems = webStoryItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'create') {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader title="Web Stories Manager" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Create Web Story</h1>
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
                    placeholder="Enter web story title" 
                    value={title} 
                    onChange={e => handleTitleChange(e.target.value)} 
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
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Author name" 
                    value={author} 
                    onChange={e => setAuthor(e.target.value)} 
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
                  <label className="block text-sm font-medium mb-1">Select storage folder</label>
                  <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                    <option value="">Select folder...</option>
                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cover Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setCoverFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pages (upload multiple images in the order you want)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handlePagesSelect}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {pagesFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{pagesFiles.length} files selected</p>
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
                    {uploading ? 'Creating...' : 'Create Web Story'}
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
        <AdminHeader title="Web Stories Manager" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Web Stories Management</h1>
              <button
                onClick={() => setView('create')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Create Web Story
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
                    placeholder="Search web stories by title, category, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Web stories list */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading web stories...</p>
                </div>
              ) : filteredWebStoryItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No web stories found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Web Story
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
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
                      {filteredWebStoryItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                                {item.cover_image_url ? (
                                  <img 
                                    src={item.cover_image_url} 
                                    alt={item.title}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <FiBook className="w-6 h-6 text-gray-400" />
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
                                  <span className="text-xs text-gray-500">
                                    {item.pages?.length || 0} pages
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{item.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{item.author}</span>
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
                                onClick={() => router.push(`/web-stories/${item.slug}`)}
                                className="text-gray-400 hover:text-gray-600"
                                title="View"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/web-stories/edit/${item.id}`)}
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