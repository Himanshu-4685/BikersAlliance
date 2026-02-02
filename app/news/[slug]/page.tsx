'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiTag, FiShare2, FiChevronLeft } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewsArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.slug) return;
      
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('slug', params.slug)
          .limit(1)
          .maybeSingle();

        if (error) {
          setError('Failed to load article');
          return;
        }

        if (!data) {
          setError('Article not found');
          return;
        }

        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.slug]);

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt || article.title,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Article URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Article URL copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return article.published_at ? new Date(article.published_at).toLocaleDateString('en-IN', {
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
            {article.cover_image_url ? (
              <Image src={article.cover_image_url} alt={article.title} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <FiTag className="mr-1" size={14} />
                {article.category || 'News'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 space-x-4">
              <div className="flex items-center">
                <FiClock className="mr-1" size={14} />
                {formatDate(article.published_at)}
              </div>
              <div>By {article.author || 'BikersAlliance Editorial'}</div>
            </div>

            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <div className="flex flex-wrap gap-2"></div>
              <button 
                onClick={handleShare}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <FiShare2 className="mr-1" size={16} />
                Share
              </button>
            </div>

            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
        </article>
      </div>
    </div>
  );
}