import { Metadata } from 'next';
import WebStoriesGrid from '@/components/web-stories/WebStoriesGrid';
import HeroSection from '@/components/web-stories/HeroSection';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Web Stories - Quick Bike Updates',
  description: 'Discover quick and engaging web stories about motorcycles, bikes reviews, tips, and industry updates in an interactive format.',
  keywords: ['web stories', 'bike stories', 'motorcycle updates', 'quick reads', 'interactive content'],
};

async function getWebStories() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await (supabase as any)
      .from('web_stories')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching web stories:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getWebStories:', err);
    return [];
  }
}

// Transform database fields to match component expectations
function transformWebStoriesData(storiesArray: any[]) {
  return storiesArray.map((story: any) => ({
    id: story.id.toString(),
    title: story.title,
    description: story.description || '',
    coverImage: story.cover_image_url || '/images/web-stories/default-story.jpg',
    publishedAt: story.published_at || story.created_at,
    slug: story.slug,
    category: story.category || 'General',
    pages: Array.isArray(story.pages) ? story.pages.length : 1,
    featured: story.featured || false,
    author: story.author || 'BikersAlliance Editorial'
  }));
}

export default async function WebStoriesPage() {
  const storiesRaw = await getWebStories();
  const allStories = transformWebStoriesData(storiesRaw);
  const featuredStories = allStories.filter(story => story.featured).slice(0, 6);
  const recentStories = allStories.filter(story => !story.featured).slice(0, 12);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Featured Stories</h2>
              <div className="flex space-x-4">
                <button className="text-red-600 hover:text-red-700 font-medium">
                  All Categories
                </button>
              </div>
            </div>
            <WebStoriesGrid stories={featuredStories} />
          </section>
        )}

        {/* Recent Stories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recent Stories</h2>
          </div>
          {recentStories.length > 0 ? (
            <WebStoriesGrid stories={recentStories} />
          ) : allStories.length > 0 ? (
            <WebStoriesGrid stories={allStories} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No web stories found. Check back later for the latest content!</p>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['Buying Guide', 'Tips', 'Comparison', 'Safety', 'Performance'].map((category) => (
              <a
                key={category}
                href={`/web-stories/category/${category.toLowerCase().replace(' ', '-')}`}
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