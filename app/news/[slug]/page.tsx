import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiTag, FiShare2, FiChevronLeft } from 'react-icons/fi';

// Mock data - in real app, this would come from an API or database
const newsArticles = {
  'royal-enfield-new-650cc-twin-engine': {
    id: '1',
    title: 'Royal Enfield Announces New 650cc Twin Engine',
    content: `
      <p>Royal Enfield, the iconic motorcycle manufacturer, has officially announced the development of a new 650cc twin-cylinder engine that promises to revolutionize the mid-displacement motorcycle segment. This announcement comes as part of the company's strategy to expand their 650cc platform beyond the current Interceptor 650 and Continental GT 650.</p>
      
      <h2>Enhanced Performance and Efficiency</h2>
      <p>The new engine is expected to deliver improved performance metrics while maintaining the characteristic Royal Enfield thump. Engineers have focused on enhancing fuel efficiency without compromising on the power delivery that enthusiasts love.</p>
      
      <h2>Technical Specifications</h2>
      <p>While complete specifications are yet to be revealed, industry sources suggest that the new engine will feature:</p>
      <ul>
        <li>Updated cylinder head design for better airflow</li>
        <li>Improved fuel injection system</li>
        <li>Enhanced cooling efficiency</li>
        <li>Reduced emissions to meet upcoming BS7 norms</li>
      </ul>
      
      <h2>Expected Launch Timeline</h2>
      <p>Royal Enfield is expected to showcase the new engine at the upcoming Auto Expo, with the first motorcycle featuring this engine likely to debut in the second half of 2024.</p>
      
      <p>This development represents Royal Enfield's commitment to innovation while staying true to their heritage of building motorcycles that offer authentic riding experiences.</p>
    `,
    excerpt: 'Royal Enfield is set to launch a new 650cc twin-cylinder engine that promises better performance and fuel efficiency.',
    image: '/images/news/royal-enfield-650.jpg',
    category: 'Launches',
    publishedAt: '2024-11-05T10:00:00Z',
    author: 'Automotive Desk',
    tags: ['Royal Enfield', '650cc', 'Twin Engine', 'Launches'],
  },
  'tvs-raider-new-color-options': {
    id: '2',
    title: 'TVS Raider Gets New Color Options',
    content: `
      <p>TVS Motor Company has introduced exciting new color schemes for the popular Raider motorcycle, giving customers more choices to express their personality. The new colors are part of TVS's strategy to keep the Raider fresh and appealing to young riders.</p>
      
      <h2>New Color Palette</h2>
      <p>The updated color options include vibrant and sporty shades that complement the Raider's aggressive styling. The new colors are designed to appeal to the bike's target demographic of young, urban riders.</p>
      
      <h2>Features Remain Unchanged</h2>
      <p>While the colors are new, TVS has retained all the popular features that made the Raider successful, including its responsive engine, smart connectivity features, and comfortable ergonomics.</p>
    `,
    excerpt: 'TVS Motor Company introduces new vibrant color schemes for the popular Raider motorcycle series.',
    image: '/images/news/tvs-raider-colors.jpg',
    category: 'Updates',
    publishedAt: '2024-11-04T15:30:00Z',
    author: 'TVS Correspondent',
    tags: ['TVS', 'Raider', 'Colors', 'Updates'],
  },
};

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = newsArticles[params.slug as keyof typeof newsArticles];
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
  };
}

export default function NewsArticlePage({ params }: Props) {
  const article = newsArticles[params.slug as keyof typeof newsArticles];

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/news"
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6"
        >
          <FiChevronLeft className="mr-1" />
          Back to News
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          <div className="relative h-64 md:h-96">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-8">
            {/* Category Badge */}
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <FiTag className="mr-1" size={14} />
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 space-x-4">
              <div className="flex items-center">
                <FiClock className="mr-1" size={14} />
                {formatDate(article.publishedAt)}
              </div>
              <div>By {article.author}</div>
            </div>

            {/* Share Button */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="flex items-center text-gray-600 hover:text-red-600">
                <FiShare2 className="mr-1" size={16} />
                Share
              </button>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        {/* Related Articles */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* You can add related articles here */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                More articles coming soon...
              </h3>
              <p className="text-gray-600">
                Stay tuned for more exciting motorcycle news and updates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}