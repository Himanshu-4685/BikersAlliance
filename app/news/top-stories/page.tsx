import { Metadata } from 'next';
import NewsGrid from '@/components/news/NewsGrid';

export const metadata: Metadata = {
  title: 'Top Stories - Latest Bike News',
  description: 'Read the most important and trending news stories from the motorcycle world. Stay updated with breaking news and major developments.',
  keywords: ['top stories', 'trending news', 'motorcycle news', 'bike updates'],
};

// Mock data for top stories
const topStories = [
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
    title: 'Electric Motorcycle Sales Rise by 45% in 2024',
    excerpt: 'The electric motorcycle segment shows remarkable growth with increasing consumer adoption across India.',
    image: '/images/news/electric-bike-sales.jpg',
    category: 'Industry',
    publishedAt: '2024-11-03T12:00:00Z',
    slug: 'electric-motorcycle-sales-rise-2024',
    featured: true,
  },
  {
    id: '3',
    title: 'Government Announces New EV Subsidies for Two-Wheelers',
    excerpt: 'New policy framework aims to accelerate electric vehicle adoption with enhanced financial incentives.',
    image: '/images/news/ev-subsidies.jpg',
    category: 'Policy',
    publishedAt: '2024-11-02T16:00:00Z',
    slug: 'government-new-ev-subsidies-two-wheelers',
    featured: true,
  },
  {
    id: '4',
    title: 'Yamaha MT-15 Version 2.0 Launched',
    excerpt: 'Yamaha introduces the updated MT-15 with new styling, improved ergonomics, and advanced features.',
    image: '/images/news/yamaha-mt15-v2.jpg',
    category: 'Launches',
    publishedAt: '2024-11-01T14:20:00Z',
    slug: 'yamaha-mt15-version-2-launched',
    featured: false,
  },
  {
    id: '5',
    title: 'Bajaj Pulsar NS Series Gets New Variants',
    excerpt: 'Bajaj Auto expands the Pulsar NS lineup with new variants offering enhanced performance and features.',
    image: '/images/news/bajaj-pulsar-ns.jpg',
    category: 'Launches',
    publishedAt: '2024-10-31T11:45:00Z',
    slug: 'bajaj-pulsar-ns-new-variants',
    featured: false,
  },
  {
    id: '6',
    title: 'Honda CB350 RS Gets ABS Update',
    excerpt: 'Honda Motorcycle and Scooter India updates the CB350 RS with enhanced ABS system and new features.',
    image: '/images/news/honda-cb350-rs.jpg',
    category: 'Updates',
    publishedAt: '2024-10-30T09:15:00Z',
    slug: 'honda-cb350-rs-abs-update',
    featured: false,
  },
];

export default function TopStoriesPage() {
  const featuredStories = topStories.filter(story => story.featured);
  const regularStories = topStories.filter(story => !story.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Top Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the most important news and developments from the motorcycle industry
          </p>
        </div>

        {/* Featured Stories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Stories</h2>
          <NewsGrid news={featuredStories} />
        </section>

        {/* More Stories */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">More Stories</h2>
          <NewsGrid news={regularStories} />
        </section>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Load More Stories
          </button>
        </div>
      </div>
    </div>
  );
}