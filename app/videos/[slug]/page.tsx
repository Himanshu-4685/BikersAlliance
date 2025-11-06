import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/videos/VideoPlayer';
import RelatedVideos from '@/components/videos/RelatedVideos';
import Link from 'next/link';
import { FiClock, FiEye, FiChevronLeft, FiShare2, FiThumbsUp } from 'react-icons/fi';

// Mock data - in real app, this would come from an API or database
const videos = {
  'royal-enfield-continental-gt-650-review': {
    id: '1',
    title: 'Royal Enfield Continental GT 650 - Complete Review',
    description: 'In this comprehensive review, we take the Royal Enfield Continental GT 650 for a thorough test ride and evaluation. We cover everything from performance and handling to comfort and value for money. The Continental GT 650 has been a game-changer in the Indian motorcycle market, bringing café racer styling with modern reliability.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/images/videos/re-gt650-review.jpg',
    duration: '12:45',
    views: '156K',
    likes: '5.2K',
    publishedAt: '2024-11-05T10:00:00Z',
    category: 'Reviews',
    tags: ['Royal Enfield', 'Continental GT 650', 'Review', 'Café Racer'],
    channel: 'BikeReviews',
  },
  'tvs-raider-vs-honda-hornet-comparison': {
    id: '2',
    title: 'TVS Raider vs Honda Hornet 2.0 - Comparison',
    description: 'A detailed comparison between two popular motorcycles in the 160cc segment. We compare performance, features, pricing, and overall value proposition to help you make an informed decision.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/images/videos/tvs-raider-vs-honda-hornet.jpg',
    duration: '15:30',
    views: '89K',
    likes: '3.1K',
    publishedAt: '2024-11-04T14:00:00Z',
    category: 'Comparisons',
    tags: ['TVS Raider', 'Honda Hornet', 'Comparison', '160cc'],
    channel: 'BikeComparisons',
  },
};

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = videos[params.slug as keyof typeof videos];
  
  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: video.title,
    description: video.description,
    keywords: video.tags,
  };
}

export default function VideoPage({ params }: Props) {
  const video = videos[params.slug as keyof typeof videos];

  if (!video) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatViews = (views: string) => {
    return views;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/videos"
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6"
        >
          <FiChevronLeft className="mr-1" />
          Back to Videos
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <VideoPlayer videoUrl={video.videoUrl} />
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Category Badge */}
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {video.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {video.title}
              </h1>

              {/* Video Stats */}
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 space-x-6">
                <div className="flex items-center">
                  <FiEye className="mr-1" size={14} />
                  {formatViews(video.views)} views
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-1" size={14} />
                  {formatDate(video.publishedAt)}
                </div>
                <div>By {video.channel}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                  <FiThumbsUp size={16} />
                  <span>{video.likes}</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                  <FiShare2 size={16} />
                  <span>Share</span>
                </button>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {video.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RelatedVideos currentVideoId={video.id} />
          </div>
        </div>
      </div>
    </div>
  );
}