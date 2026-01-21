import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import VideoPlayer from '@/components/videos/VideoPlayer';
import RelatedVideos from '@/components/videos/RelatedVideos';
import Link from 'next/link';
import { FiClock, FiEye, FiChevronLeft, FiShare2, FiThumbsUp } from 'react-icons/fi';
import { createServerClient } from '@/lib/supabase-server';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('slug', params.slug)
      .limit(1)
      .maybeSingle();

    if (error || !data) return { title: 'Video Maintenance' };

    return { title: (data as any).title, description: (data as any).description || '', keywords: [] };
  } catch (err) {
    return { title: 'Video Maintenance' };
  }
}

export default async function VideoPage({ params }: Props) {
  const supabase = createServerClient();
  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('slug', params.slug)
    .limit(1)
    .maybeSingle();

  if (error || !video) {
    redirect('/videos/maintenance');
  }

  const formatDate = (dateString: string) => {
    return (video as any).published_at ? new Date((video as any).published_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : '';
  };

  const formatViews = (views: any) => views || '0';

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
              <VideoPlayer videoUrl={(video as any).video_url} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {(video as any).source || 'Video'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{(video as any).title}</h1>

              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 space-x-6">
                <div className="flex items-center">
                  <FiEye className="mr-1" size={14} />
                  {formatViews((video as any).views)} views
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-1" size={14} />
                  {formatDate((video as any).published_at)}
                </div>
                <div>By {(video as any).source || 'Channel'}</div>
              </div>

              <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                  <FiThumbsUp size={16} />
                  <span>{(video as any).likes || '0'}</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                  <FiShare2 size={16} />
                  <span>Share</span>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{(video as any).description}</p>
                <div className="flex flex-wrap gap-2"></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <RelatedVideos currentVideoId={(video as any).id} />
          </div>
        </div>
      </div>
    </div>
  );
}