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