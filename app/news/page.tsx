import { Metadata } from 'next';
import NewsGrid from '@/components/news/NewsGrid';
import HeroSection from '@/components/news/HeroSection';

export const metadata: Metadata = {
  title: 'Latest Bike News & Updates',
  description: 'Stay updated with the latest news, launches, and updates from the motorcycle world. Get insights on new bike launches, reviews, and industry trends.',
  keywords: ['bike news', 'motorcycle news', 'latest launches', 'bike updates', 'industry news'],
};

// Mock data - in real app, this would come from an API or database
const featuredNews = [
  {
    id: '1',
    title: 'Royal Enfield Announces New 650cc Twin Engine',
    excerpt: 'Royal Enfield is set to launch a new 650cc twin-cylinder engine that promises better performance and fuel efficiency.',
    image: '/images/news/royal-enfield-650.jpg',
    category: 'Launches',
    publishedAt: '2024-11-05T10:00:00Z',
    slug: 'royal-enfield-new-650cc-twin-engine',
    featured: true,
  },
  {
    id: '2',
    title: 'TVS Raider Gets New Color Options',
    excerpt: 'TVS Motor Company introduces new vibrant color schemes for the popular Raider motorcycle series.',
    image: '/images/news/tvs-raider-colors.jpg',
    category: 'Updates',
    publishedAt: '2024-11-04T15:30:00Z',
    slug: 'tvs-raider-new-color-options',
    featured: false,
  },
  {
    id: '3',
    title: 'Electric Motorcycle Sales Rise by 45% in 2024',
    excerpt: 'The electric motorcycle segment shows remarkable growth with increasing consumer adoption across India.',
    image: '/images/news/electric-bike-sales.jpg',
    category: 'Industry',
    publishedAt: '2024-11-03T12:00:00Z',
    slug: 'electric-motorcycle-sales-rise-2024',
    featured: false,
  },
];

const recentNews = [
  {
    id: '4',
    title: 'Honda CB350 RS Gets ABS Update',
    excerpt: 'Honda Motorcycle and Scooter India updates the CB350 RS with enhanced ABS system and new features.',
    image: '/images/news/honda-cb350-rs.jpg',
    category: 'Updates',
    publishedAt: '2024-11-02T09:15:00Z',
    slug: 'honda-cb350-rs-abs-update',
    featured: false,
  },
  {
    id: '5',
    title: 'Yamaha MT-15 Version 2.0 Launched',
    excerpt: 'Yamaha introduces the updated MT-15 with new styling, improved ergonomics, and advanced features.',
    image: '/images/news/yamaha-mt15-v2.jpg',
    category: 'Launches',
    publishedAt: '2024-11-01T14:20:00Z',
    slug: 'yamaha-mt15-version-2-launched',
    featured: false,
  },
  {
    id: '6',
    title: 'Bajaj Pulsar NS Series Gets New Variants',
    excerpt: 'Bajaj Auto expands the Pulsar NS lineup with new variants offering enhanced performance and features.',
    image: '/images/news/bajaj-pulsar-ns.jpg',
    category: 'Launches',
    publishedAt: '2024-10-31T11:45:00Z',
    slug: 'bajaj-pulsar-ns-new-variants',
    featured: false,
  },
];

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured News */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Featured News</h2>
            <a href="/news/top-stories" className="text-red-600 hover:text-red-700 font-medium">
              View All →
            </a>
          </div>
          <NewsGrid news={featuredNews} />
        </section>

        {/* Recent News */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recent News</h2>
          </div>
          <NewsGrid news={recentNews} />
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