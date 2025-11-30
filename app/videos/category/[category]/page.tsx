import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VideoGrid from '@/components/videos/VideoGrid';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface Props {
  params: {
    category: string;
  };
}

// Valid categories for videos
const validCategories = [
  'general', 'reviews', 'comparisons', 'tests', 'first-rides', 'tips', 'buying-guide'
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = decodeURIComponent(params.category).replace('-', ' ');
  const categoryTitle = category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${categoryTitle} Videos - Motorcycle Reviews & Tests`,
    description: `Watch the latest ${categoryTitle.toLowerCase()} videos including motorcycle reviews, tests, and riding tips.`,
    keywords: [`${categoryTitle} videos`, 'motorcycle videos', 'bike reviews', `${categoryTitle} tests`],
  };
}

async function getVideosByCategory(category: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Convert URL category back to database format
    const dbCategory = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const { data, error } = await (supabase as any)
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .eq('category', dbCategory)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching category videos:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getVideosByCategory:', err);
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

export default async function CategoryVideosPage({ params }: Props) {
  const category = decodeURIComponent(params.category).toLowerCase();
  
  // Check if category is valid
  if (!validCategories.includes(category)) {
    notFound();
  }
  
  const categoryVideosRaw = await getVideosByCategory(category);
  const categoryVideos = transformVideoData(categoryVideosRaw);
  const categoryTitle = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {categoryTitle} Videos
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
              Watch the latest {categoryTitle.toLowerCase()} videos and motorcycle content
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-red-600">
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <a href="/videos" className="ml-1 text-sm font-medium text-gray-700 hover:text-red-600 md:ml-2">
                  Videos
                </a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{categoryTitle}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Category Videos */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {categoryTitle} Videos ({categoryVideos.length})
            </h2>
          </div>
          
          {categoryVideos.length > 0 ? (
            <VideoGrid videos={categoryVideos} />
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No {categoryTitle} Videos Yet
                </h3>
                <p className="text-gray-600 mb-8">
                  We haven't published any {categoryTitle.toLowerCase()} videos yet. Check back soon for new content!
                </p>
                <a
                  href="/videos"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Browse All Videos
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Back to Categories */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Browse Other Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {['General', 'Reviews', 'Comparisons', 'Tests', 'First Rides', 'Tips', 'Buying Guide']
                .filter(cat => cat.toLowerCase().replace(' ', '-') !== category)
                .map((cat) => (
                <a
                  key={cat}
                  href={`/videos/category/${cat.toLowerCase().replace(' ', '-')}`}
                  className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow border border-gray-200 hover:border-red-300"
                >
                  <h4 className="font-semibold text-gray-900">{cat}</h4>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}