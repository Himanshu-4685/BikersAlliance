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

  // Normalize story data to match component interface
  const normalized = {
    id: (story as any).id,
    title: (story as any).title,
    description: (story as any).description || '',
    cover_image_url: (story as any).cover_image_url,
    published_at: (story as any).published_at,
    category: (story as any).category || 'General',
    pages: Array.isArray((story as any).pages) ? (story as any).pages : []
  };

  return (
    <div className="min-h-screen bg-black">
      <WebStoryViewer story={normalized} />
    </div>
  );
}