import NewsCard from './NewsCard';

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

interface NewsGridProps {
  news: NewsArticle[];
  columns?: 1 | 2 | 3 | 4;
}

export default function NewsGrid({ news, columns = 3 }: NewsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {news.map((article) => (
        <NewsCard 
          key={article.id} 
          article={article}
          size={columns === 1 ? 'large' : 'medium'}
        />
      ))}
    </div>
  );
}