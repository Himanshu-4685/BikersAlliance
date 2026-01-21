import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import VideoGrid from '@/components/videos/VideoGrid';
import HeroSection from '@/components/videos/HeroSection';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Bike Videos - Reviews, Tests & Rides',
  description: 'Watch the latest bike videos including reviews, test rides, comparisons, and riding tips from motorcycle experts.',
  keywords: ['bike videos', 'motorcycle reviews', 'test rides', 'bike comparisons', 'riding videos'],
};

async function getVideos() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await (supabase as any)
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getVideos:', err);
    return [];
  }
}

// Transform database fields to match component expectations
function transformVideoData(videosArray: any[]) {
  return videosArray.map((video: any) => ({
    id: video.id.toString(),
    title: video.title,
    description: video.description || '',
    thumbnail: video.thumbnail_url || '/images/videos/default-video.jpg',
    duration: video.duration || '0:00',
    views: video.views || '0',
    publishedAt: video.published_at || video.created_at,
    slug: video.slug,
    category: video.category || 'General',
    featured: video.featured || false,
    video_url: video.video_url,
    source: video.source || 'YouTube'
  }));
}

export default async function VideosPage() {
  const videosRaw = await getVideos();
  
  // If no videos exist at all, redirect to maintenance page
  if (videosRaw.length === 0) {
    redirect('/videos/maintenance');
  }
  
  const allVideos = transformVideoData(videosRaw);
  const featuredVideos = allVideos.filter(video => video.featured).slice(0, 6);
  const recentVideos = allVideos.filter(video => !video.featured).slice(0, 12);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Videos */}
        {featuredVideos.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Featured Videos</h2>
              <div className="flex space-x-4">
                <button className="text-red-600 hover:text-red-700 font-medium">
                  All Categories
                </button>
              </div>
            </div>
            <VideoGrid videos={featuredVideos} />
          </section>
        )}

        {/* Recent Videos */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recent Videos</h2>
          </div>
          {recentVideos.length > 0 ? (
            <VideoGrid videos={recentVideos} />
          ) : allVideos.length > 0 ? (
            <VideoGrid videos={allVideos} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No videos found. Check back later for the latest content!</p>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['Reviews', 'Comparisons', 'Tests', 'First Rides', 'Tips'].map((category) => (
              <a
                key={category}
                href={`/videos/category/${category.toLowerCase()}`}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}