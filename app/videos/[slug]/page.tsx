'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/videos/VideoPlayer';
import RelatedVideos from '@/components/videos/RelatedVideos';
import Link from 'next/link';
import { FiClock, FiEye, FiChevronLeft, FiShare2, FiThumbsUp, FiX } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!params.slug) return;
      
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('slug', params.slug)
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          router.push('/videos/maintenance');
          return;
        }

        setVideo(data);
      } catch (err) {
        router.push('/videos/maintenance');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [params.slug, router]);

  const formatDate = (dateString: string) => {
    return video?.published_at ? new Date(video.published_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : '';
  };

  const formatViews = (views: any) => views || '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/videos"
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6"
        >
          <FiChevronLeft className="mr-1" />
          Back to Videos
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <VideoPlayer videoUrl={video.video_url} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {video.source || 'Video'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{video.title}</h1>

              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 space-x-6">
                <div className="flex items-center">
                  <FiEye className="mr-1" size={14} />
                  {formatViews(video.views)} views
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-1" size={14} />
                  {formatDate(video.published_at)}
                </div>
                <div>By {video.source || 'Channel'}</div>
              </div>

              <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <button 
                  onClick={() => setShowComingSoonModal(true)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <FiThumbsUp size={16} />
                  <span>{video.likes || '0'}</span>
                </button>
                <button 
                  onClick={() => setShowComingSoonModal(true)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <FiShare2 size={16} />
                  <span>Share</span>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{video.description}</p>
                <div className="flex flex-wrap gap-2"></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <RelatedVideos currentVideoId={video.id} />
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={24} />
            </button>
            
            <div className="text-center">
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <FiThumbsUp className="w-12 h-12 text-red-600" />
                  <FiShare2 className="w-12 h-12 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Interactive Features Coming Soon!
              </h3>
              
              <p className="text-gray-600 mb-6">
                We're working on bringing you enhanced video interaction features like likes and sharing. 
                These features will be available in our next update.
              </p>
              
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}