import WebStoryCard from './WebStoryCard';

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

interface WebStoriesGridProps {
  stories: WebStory[];
  columns?: 2 | 3 | 4;
}

export default function WebStoriesGrid({ stories, columns = 3 }: WebStoriesGridProps) {
  const gridCols = {
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
      {stories.map((story) => (
        <WebStoryCard 
          key={story.id} 
          story={story}
          size="medium"
        />
      ))}
    </div>
  );
}