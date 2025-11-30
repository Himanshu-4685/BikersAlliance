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

interface VideoGridProps {
  videos: Video[];
  columns?: 1 | 2 | 3 | 4;
}

export default function VideoGrid({ videos, columns = 3 }: VideoGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          video={video}
          size={columns === 1 ? 'large' : 'medium'}
        />
      ))}
    </div>
  );
}