import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiEye, FiPlay } from 'react-icons/fi';

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

interface VideoCardProps {
  video: Video;
  size?: 'small' | 'medium' | 'large';
}

export default function VideoCard({ video, size = 'medium' }: VideoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const cardSizes = {
    small: 'h-64',
    medium: 'h-80',
    large: 'h-96',
  };

  return (
    <Link href={`/videos/${video.slug}`}>
      <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${cardSizes[size]}`}>
        {/* Thumbnail */}
        <div className="relative h-48 group">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
            <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform">
              <FiPlay className="text-white" size={24} />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </span>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
              {video.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
            {video.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 flex-1 mb-3">
            {video.description}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <FiEye className="mr-1" size={12} />
                {video.views}
              </div>
              <div className="flex items-center">
                <FiClock className="mr-1" size={12} />
                {formatDate(video.publishedAt)}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}