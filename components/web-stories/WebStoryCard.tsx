import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiLayers } from 'react-icons/fi';

interface WebStory {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  publishedAt: string;
  slug: string;
  category: string;
  pages: number;
  featured?: boolean;
}

interface WebStoryCardProps {
  story: WebStory;
  size?: 'small' | 'medium' | 'large';
}

export default function WebStoryCard({ story, size = 'medium' }: WebStoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const cardSizes = {
    small: 'h-80',
    medium: 'h-96',
    large: 'h-[28rem]',
  };

  return (
    <Link href={`/web-stories/${story.slug}`}>
      <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer ${cardSizes[size]} relative group`}>
        {/* Cover Image */}
        <div className="relative h-full">
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          {/* Story Indicator */}
          <div className="absolute top-3 left-3 right-3">
            <div className="flex space-x-1">
              {Array.from({ length: story.pages }).map((_, index) => (
                <div 
                  key={index} 
                  className="h-1 bg-white bg-opacity-30 rounded-full flex-1"
                />
              ))}
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-8 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
              {story.category}
            </span>
          </div>

          {/* Pages Count */}
          <div className="absolute top-8 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-60 text-white">
              <FiLayers className="mr-1" size={10} />
              {story.pages}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-bold mb-2 line-clamp-2">
              {story.title}
            </h3>
            
            <p className="text-sm text-gray-200 line-clamp-2 mb-3">
              {story.description}
            </p>

            {/* Date */}
            <div className="flex items-center text-xs text-gray-300">
              <FiClock className="mr-1" size={12} />
              {formatDate(story.publishedAt)}
            </div>
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-red-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        </div>
      </article>
    </Link>
  );
}