import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsGrid from '@/components/news/NewsGrid';
import HeroSection from '@/components/news/HeroSection';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface Props {
  params: {
    category: string;
  };
}

// Valid categories
const validCategories = [
  'general', 'launches', 'reviews', 'industry', 'updates', 'electric', 'scooters', 'motorcycles'
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${categoryTitle} News - Latest Updates`,
    description: `Stay updated with the latest ${category} news, launches, and updates from the motorcycle world.`,
    keywords: [`${category} news`, 'motorcycle news', 'bike updates', `${category} launches`],
  };
}

async function getNewsByCategory(category: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await (supabase as any)
      .from('news')
      .select('*')
      .eq('is_published', true)
      .eq('category', category.charAt(0).toUpperCase() + category.slice(1))
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching category news:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getNewsByCategory:', err);
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

export default async function CategoryNewsPage({ params }: Props) {
  const category = decodeURIComponent(params.category).toLowerCase();
  
  // Check if category is valid
  if (!validCategories.includes(category)) {
    notFound();
  }
  
  const categoryNewsRaw = await getNewsByCategory(category);
  const categoryNews = transformNewsData(categoryNewsRaw);
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {categoryTitle} News
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
              Latest updates and news in the {categoryTitle.toLowerCase()} category
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
                <a href="/news" className="ml-1 text-sm font-medium text-gray-700 hover:text-red-600 md:ml-2">
                  News
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

        {/* Category News */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {categoryTitle} News ({categoryNews.length})
            </h2>
          </div>
          
          {categoryNews.length > 0 ? (
            <NewsGrid news={categoryNews} />
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No {categoryTitle} News Yet
                </h3>
                <p className="text-gray-600 mb-8">
                  We haven't published any {categoryTitle.toLowerCase()} news yet. Check back soon for the latest updates!
                </p>
                <a
                  href="/news"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Browse All News
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Back to Categories */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Browse Other Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['General', 'Launches', 'Reviews', 'Industry', 'Updates', 'Electric', 'Scooters', 'Motorcycles']
                .filter(cat => cat.toLowerCase() !== category)
                .map((cat) => (
                <a
                  key={cat}
                  href={`/news/category/${cat.toLowerCase()}`}
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