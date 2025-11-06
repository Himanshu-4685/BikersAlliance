import { Metadata } from 'next';
import WebStoriesGrid from '@/components/web-stories/WebStoriesGrid';
import HeroSection from '@/components/web-stories/HeroSection';

export const metadata: Metadata = {
  title: 'Web Stories - Quick Bike Updates',
  description: 'Discover quick and engaging web stories about motorcycles, bikes reviews, tips, and industry updates in an interactive format.',
  keywords: ['web stories', 'bike stories', 'motorcycle updates', 'quick reads', 'interactive content'],
};

// Mock data - in real app, this would come from an API or database
const featuredStories = [
  {
    id: '1',
    title: '5 Best Bikes Under 2 Lakhs',
    description: 'Discover the top 5 motorcycles you can buy under 2 lakh rupees in 2024',
    coverImage: '/images/web-stories/best-bikes-under-2l.jpg',
    publishedAt: '2024-11-05T10:00:00Z',
    slug: 'best-bikes-under-2-lakhs',
    category: 'Buying Guide',
    pages: 6,
    featured: true,
  },
  {
    id: '2',
    title: 'Electric Bike Maintenance Tips',
    description: 'Essential maintenance tips to keep your electric motorcycle running smoothly',
    coverImage: '/images/web-stories/electric-bike-maintenance.jpg',
    publishedAt: '2024-11-04T15:30:00Z',
    slug: 'electric-bike-maintenance-tips',
    category: 'Tips',
    pages: 8,
    featured: true,
  },
  {
    id: '3',
    title: 'Royal Enfield vs KTM: Which to Choose?',
    description: 'Compare Royal Enfield and KTM motorcycles to find your perfect ride',
    coverImage: '/images/web-stories/re-vs-ktm.jpg',
    publishedAt: '2024-11-03T12:00:00Z',
    slug: 'royal-enfield-vs-ktm-comparison',
    category: 'Comparison',
    pages: 7,
    featured: true,
  },
];

const recentStories = [
  {
    id: '4',
    title: 'Motorcycle Safety Gear Guide',
    description: 'Complete guide to essential safety gear every rider should have',
    coverImage: '/images/web-stories/safety-gear-guide.jpg',
    publishedAt: '2024-11-02T16:00:00Z',
    slug: 'motorcycle-safety-gear-guide',
    category: 'Safety',
    pages: 9,
    featured: false,
  },
  {
    id: '5',
    title: 'Top 10 Fastest Bikes in India',
    description: 'Meet the fastest motorcycles available in the Indian market',
    coverImage: '/images/web-stories/fastest-bikes-india.jpg',
    publishedAt: '2024-11-01T14:20:00Z',
    slug: 'top-10-fastest-bikes-india',
    category: 'Performance',
    pages: 11,
    featured: false,
  },
  {
    id: '6',
    title: 'Monsoon Riding Tips',
    description: 'Stay safe while riding during the monsoon season with these expert tips',
    coverImage: '/images/web-stories/monsoon-riding-tips.jpg',
    publishedAt: '2024-10-31T11:45:00Z',
    slug: 'monsoon-riding-tips',
    category: 'Tips',
    pages: 6,
    featured: false,
  },
];

export default function WebStoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Stories */}
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

        {/* Recent Stories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recent Stories</h2>
          </div>
          <WebStoriesGrid stories={recentStories} />
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