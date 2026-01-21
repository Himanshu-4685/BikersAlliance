import VideoCard from './VideoCard';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  publishedAt: string;
  slug: string;
  category: string;
  featured?: boolean;
}

interface RelatedVideosProps {
  currentVideoId: string;
}

// Mock data for related videos
const allVideos: Video[] = [
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

export default function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  // Filter out the current video and take first 4 related videos
  const relatedVideos = allVideos
    .filter(video => video.id !== currentVideoId)
    .slice(0, 4);

  if (relatedVideos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Related Videos</h3>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Videos are currently under maintenance</p>
          <a
            href="/news"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Browse News Instead →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Related Videos</h3>
      
      <div className="space-y-4">
        {relatedVideos.map((video) => (
          <div key={video.id} className="border-b pb-4 last:border-b-0">
            <VideoCard video={video} size="small" />
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <a
          href="/videos"
          className="text-red-600 hover:text-red-700 font-medium"
        >
          View All Videos →
        </a>
      </div>
    </div>
  );
}