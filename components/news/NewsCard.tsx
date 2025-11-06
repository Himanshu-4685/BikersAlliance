import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiTag } from 'react-icons/fi';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  publishedAt: string;
  slug: string;
  featured?: boolean;
}

interface NewsCardProps {
  article: NewsArticle;
  size?: 'small' | 'medium' | 'large';
}

export default function NewsCard({ article, size = 'medium' }: NewsCardProps) {
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
    <Link href={`/news/${article.slug}`}>
      <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${cardSizes[size]}`}>
        {/* Image */}
        <div className="relative h-48">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
              <FiTag className="mr-1" size={10} />
              {article.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
            {article.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-3 flex-1 mb-3">
            {article.excerpt}
          </p>

          {/* Date */}
          <div className="flex items-center text-xs text-gray-500">
            <FiClock className="mr-1" size={12} />
            {formatDate(article.publishedAt)}
          </div>
        </div>
      </article>
    </Link>
  );
}