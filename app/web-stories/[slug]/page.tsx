import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WebStoryViewer from '@/components/web-stories/WebStoryViewer';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';
import { createServerClient } from '@/lib/supabase-server';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('web_stories')
      .select('*')
      .eq('slug', params.slug)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { title: 'Story Not Found' };
    }

    return {
      title: (data as any).title,
      description: (data as any).pages && Array.isArray((data as any).pages) && (data as any).pages[0]?.caption ? (data as any).pages[0].caption : '',
      keywords: ['web story', 'bikes', 'motorcycle']
    };
  } catch (err) {
    return { title: 'Story' };
  }
}

export default async function WebStoryPage({ params }: Props) {
  const supabase = createServerClient();
  const { data: story, error } = await supabase
    .from('web_stories')
    .select('*')
    .eq('slug', params.slug)
    .limit(1)
    .maybeSingle();

  if (error || !story) {
    notFound();
  }

  // Normalize story pages if stored as JSON
  const normalized = {
    id: (story as any).id,
    title: (story as any).title,
    description: '',
    coverImage: (story as any).cover_image_url,
    publishedAt: (story as any).published_at,
    category: '',
    pages: Array.isArray((story as any).pages) ? (story as any).pages.map((p: any, i: number) => ({ id: i + 1, image: p.image_url || p.image || '', title: p.title || '', text: p.caption || '' })) : []
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/web-stories"
          className="inline-flex items-center text-white bg-black bg-opacity-50 hover:bg-opacity-70 px-3 py-2 rounded-lg transition-colors"
        >
          <FiChevronLeft className="mr-1" />
          Back
        </Link>
      </div>

      <WebStoryViewer story={normalized} />
    </div>
  );
}