import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiTag, FiShare2, FiChevronLeft } from 'react-icons/fi';
import { createServerClient } from '@/lib/supabase-server';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', params.slug)
      .limit(1)
      .maybeSingle();

    if (error || !data) return { title: 'Article Not Found' };

    return { title: (data as any).title, description: (data as any).excerpt || '', keywords: [] };
  } catch (err) {
    return { title: 'Article' };
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const supabase = createServerClient();
  const { data: article, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', params.slug)
    .limit(1)
    .maybeSingle();

  if (error || !article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return (article as any).published_at ? new Date((article as any).published_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/news"
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6"
        >
          <FiChevronLeft className="mr-1" />
          Back to News
        </Link>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64 md:h-96">
            {(article as any).cover_image_url ? (
              <Image src={(article as any).cover_image_url} alt={(article as any).title} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <FiTag className="mr-1" size={14} />
                {(article as any).category || 'News'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{(article as any).title}</h1>

            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 space-x-4">
              <div className="flex items-center">
                <FiClock className="mr-1" size={14} />
                {formatDate((article as any).published_at)}
              </div>
              <div>By {(article as any).author || 'Staff'}</div>
            </div>

            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <div className="flex flex-wrap gap-2"></div>
              <button className="flex items-center text-gray-600 hover:text-red-600">
                <FiShare2 className="mr-1" size={16} />
                Share
              </button>
            </div>

            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: (article as any).content || '' }} />
          </div>
        </article>
      </div>
    </div>
  );
}