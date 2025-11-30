import { Metadata } from 'next';
import NewsGrid from '@/components/news/NewsGrid';
import HeroSection from '@/components/news/HeroSection';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Latest Bike News & Updates',
  description: 'Stay updated with the latest news, launches, and updates from the motorcycle world. Get insights on new bike launches, reviews, and industry trends.',
  keywords: ['bike news', 'motorcycle news', 'latest launches', 'bike updates', 'industry news'],
};

async function getFeaturedNews() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await (supabase as any)
      .from('news')
      .select('*')
      .eq('is_published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching featured news:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getFeaturedNews:', err);
    return [];
  }
}

async function getRecentNews() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await (supabase as any)
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Error fetching recent news:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getRecentNews:', err);
    return [];
  }
}

// Transform database fields to match component expectations
function transformNewsData(newsArray: any[]) {
  return newsArray.map((news: any) => ({
    id: news.id.toString(),
    title: news.title,
    excerpt: news.excerpt || '',
    image: news.cover_image_url || '/images/news/default-news.jpg',
    category: news.category || 'General',
    publishedAt: news.published_at || news.created_at,
    slug: news.slug,
    featured: news.featured || false,
  }));
}

export default async function NewsPage() {
  const [featuredNewsRaw, recentNewsRaw] = await Promise.all([
    getFeaturedNews(),
    getRecentNews(),
  ]);

  const featuredNews = transformNewsData(featuredNewsRaw);
  const recentNews = transformNewsData(recentNewsRaw.filter((news: any) => !news.featured));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured News */}
        {featuredNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Featured News</h2>
              <a href="/news/top-stories" className="text-red-600 hover:text-red-700 font-medium">
                View All →
              </a>
            </div>
            <NewsGrid news={featuredNews} />
          </section>
        )}

        {/* Recent News */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recent News</h2>
          </div>
          {recentNews.length > 0 ? (
            <NewsGrid news={recentNews} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No news articles found. Check back later for the latest updates!</p>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Launches', 'Reviews', 'Industry', 'Updates'].map((category) => (
              <a
                key={category}
                href={`/news/category/${category.toLowerCase()}`}
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