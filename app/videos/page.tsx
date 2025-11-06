import { Metadata } from 'next';
import VideoGrid from '@/components/videos/VideoGrid';
import HeroSection from '@/components/videos/HeroSection';

export const metadata: Metadata = {
  title: 'Bike Videos - Reviews, Tests & Rides',
  description: 'Watch the latest bike videos including reviews, test rides, comparisons, and riding tips from motorcycle experts.',
  keywords: ['bike videos', 'motorcycle reviews', 'test rides', 'bike comparisons', 'riding videos'],
};

// Mock data - in real app, this would come from an API or database
const featuredVideos = [
  {
    id: '1',
    title: 'Royal Enfield Continental GT 650 - Complete Review',
    description: 'In-depth review of the Royal Enfield Continental GT 650 covering performance, features, and riding experience.',
    thumbnail: '/images/videos/re-gt650-review.jpg',
    duration: '12:45',
    views: '156K',
    publishedAt: '2024-11-05T10:00:00Z',
    slug: 'royal-enfield-continental-gt-650-review',
    category: 'Reviews',
    featured: true,
  },
  {
    id: '2',
    title: 'TVS Raider vs Honda Hornet 2.0 - Comparison',
    description: 'Head-to-head comparison between TVS Raider and Honda Hornet 2.0 to help you choose the right bike.',
    thumbnail: '/images/videos/tvs-raider-vs-honda-hornet.jpg',
    duration: '15:30',
    views: '89K',
    publishedAt: '2024-11-04T14:00:00Z',
    slug: 'tvs-raider-vs-honda-hornet-comparison',
    category: 'Comparisons',
    featured: true,
  },
  {
    id: '3',
    title: 'Electric Bike Highway Test - Range & Performance',
    description: 'Testing electric motorcycles on highways to evaluate real-world range and performance capabilities.',
    thumbnail: '/images/videos/electric-bike-highway-test.jpg',
    duration: '18:20',
    views: '234K',
    publishedAt: '2024-11-03T11:30:00Z',
    slug: 'electric-bike-highway-test-range-performance',
    category: 'Tests',
    featured: true,
  },
];

const recentVideos = [
  {
    id: '4',
    title: 'Yamaha MT-15 Version 2.0 - First Ride',
    description: 'First ride impressions of the updated Yamaha MT-15 with new features and improvements.',
    thumbnail: '/images/videos/yamaha-mt15-v2-ride.jpg',
    duration: '10:15',
    views: '67K',
    publishedAt: '2024-11-02T16:00:00Z',
    slug: 'yamaha-mt15-version-2-first-ride',
    category: 'First Rides',
    featured: false,
  },
  {
    id: '5',
    title: 'Motorcycle Maintenance Tips for Beginners',
    description: 'Essential maintenance tips every motorcycle owner should know to keep their bike in top condition.',
    thumbnail: '/images/videos/bike-maintenance-tips.jpg',
    duration: '14:45',
    views: '123K',
    publishedAt: '2024-11-01T12:00:00Z',
    slug: 'motorcycle-maintenance-tips-beginners',
    category: 'Tips',
    featured: false,
  },
  {
    id: '6',
    title: 'Best Bikes Under 1 Lakh in 2024',
    description: 'Comprehensive guide to the best motorcycles you can buy under 1 lakh rupees in 2024.',
    thumbnail: '/images/videos/best-bikes-under-1-lakh.jpg',
    duration: '16:30',
    views: '189K',
    publishedAt: '2024-10-31T10:00:00Z',
    slug: 'best-bikes-under-1-lakh-2024',
    category: 'Buying Guide',
    featured: false,
  },
];

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Videos */}
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

        {/* Recent Videos */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recent Videos</h2>
          </div>
          <VideoGrid videos={recentVideos} />
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