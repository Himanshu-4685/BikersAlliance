'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { storageManager } from '@/utils/supabase-storage';

export default function AdminVideosPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    fetchFolders();
  }, []);

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
        body: JSON.stringify({ title, slug, description, video_url: finalVideoUrl, thumbnail_url: thumbnailUrl })
      });

      const data = await resp.json();
      if (!data.success) {
        setError(data.error || 'Failed to create video');
      } else {
        router.push('/admin/videos');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Videos Manager" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create Video</h1>

            {error && <div className="mb-4 text-red-600">{error}</div>}

            <div className="bg-white rounded-lg p-6 space-y-4">
              <input className="w-full p-2 border" placeholder="Title" value={title} onChange={e => handleTitleChange(e.target.value)} />
              <input className="w-full p-2 border" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} />
              <textarea className="w-full p-2 border h-32" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

              <div>
                <label className="block text-sm font-medium mb-1">Select storage folder</label>
                <select className="p-2 border w-full" value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                  <option value="">Select folder...</option>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Video URL (YouTube or external)</label>
                <input className="w-full p-2 border" placeholder="https://..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Or upload video file</label>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail (optional)</label>
                <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
              </div>

              <div className="flex space-x-2">
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={uploading}>{uploading ? 'Saving...' : 'Create'}</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
