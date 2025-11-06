import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WebStoryViewer from '@/components/web-stories/WebStoryViewer';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';

// Mock data - in real app, this would come from an API or database
const webStories = {
  'best-bikes-under-2-lakhs': {
    id: '1',
    title: '5 Best Bikes Under 2 Lakhs',
    description: 'Discover the top 5 motorcycles you can buy under 2 lakh rupees in 2024',
    coverImage: '/images/web-stories/best-bikes-under-2l.jpg',
    publishedAt: '2024-11-05T10:00:00Z',
    category: 'Buying Guide',
    pages: [
      {
        id: 1,
        image: '/images/web-stories/pages/cover-best-bikes.jpg',
        title: '5 Best Bikes Under ₹2 Lakhs',
        text: 'Looking for a great motorcycle under 2 lakhs? Here are our top picks for 2024!',
      },
      {
        id: 2,
        image: '/images/web-stories/pages/tvs-raider.jpg',
        title: 'TVS Raider 125',
        text: 'Starting at ₹98,389, the TVS Raider offers great value with modern features and sporty styling.',
      },
      {
        id: 3,
        image: '/images/web-stories/pages/honda-hornet.jpg',
        title: 'Honda Hornet 2.0',
        text: 'Priced at ₹1.26 lakh, Honda Hornet 2.0 delivers reliable performance with Honda\'s build quality.',
      },
      {
        id: 4,
        image: '/images/web-stories/pages/yamaha-fz.jpg',
        title: 'Yamaha FZ-S Fi',
        text: 'At ₹1.16 lakh, the FZ-S Fi combines style, comfort, and Yamaha\'s proven engineering.',
      },
      {
        id: 5,
        image: '/images/web-stories/pages/bajaj-pulsar.jpg',
        title: 'Bajaj Pulsar NS160',
        text: 'Starting at ₹1.18 lakh, the NS160 offers sporty performance and aggressive styling.',
      },
      {
        id: 6,
        image: '/images/web-stories/pages/hero-xtreme.jpg',
        title: 'Hero Xtreme 160R',
        text: 'Priced at ₹1.20 lakh, Hero Xtreme 160R provides excellent value and fuel efficiency.',
      },
    ],
  },
  'electric-bike-maintenance-tips': {
    id: '2',
    title: 'Electric Bike Maintenance Tips',
    description: 'Essential maintenance tips to keep your electric motorcycle running smoothly',
    coverImage: '/images/web-stories/electric-bike-maintenance.jpg',
    publishedAt: '2024-11-04T15:30:00Z',
    category: 'Tips',
    pages: [
      {
        id: 1,
        image: '/images/web-stories/pages/cover-electric-maintenance.jpg',
        title: 'Electric Bike Maintenance',
        text: 'Keep your electric motorcycle in top condition with these essential maintenance tips!',
      },
      {
        id: 2,
        image: '/images/web-stories/pages/battery-care.jpg',
        title: 'Battery Care',
        text: 'Charge regularly, avoid deep discharge, and store in cool, dry places to extend battery life.',
      },
      {
        id: 3,
        image: '/images/web-stories/pages/tire-pressure.jpg',
        title: 'Check Tire Pressure',
        text: 'Maintain proper tire pressure for optimal range and safety. Check monthly!',
      },
      {
        id: 4,
        image: '/images/web-stories/pages/brake-maintenance.jpg',
        title: 'Brake Maintenance',
        text: 'Inspect brake pads and fluid regularly. Electric bikes are heavier and need good brakes.',
      },
      {
        id: 5,
        image: '/images/web-stories/pages/chain-cleaning.jpg',
        title: 'Chain & Drive',
        text: 'Clean and lubricate the chain regularly. Some electric bikes have belt drives that need less maintenance.',
      },
      {
        id: 6,
        image: '/images/web-stories/pages/software-updates.jpg',
        title: 'Software Updates',
        text: 'Keep your bike\'s software updated for optimal performance and new features.',
      },
      {
        id: 7,
        image: '/images/web-stories/pages/professional-service.jpg',
        title: 'Professional Service',
        text: 'Schedule regular professional maintenance to ensure warranty coverage and safety.',
      },
      {
        id: 8,
        image: '/images/web-stories/pages/conclusion.jpg',
        title: 'Ride Safe!',
        text: 'Regular maintenance ensures your electric bike stays reliable and efficient for years to come.',
      },
    ],
  },
};

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = webStories[params.slug as keyof typeof webStories];
  
  if (!story) {
    return {
      title: 'Story Not Found',
    };
  }

  return {
    title: story.title,
    description: story.description,
    keywords: [story.category, 'web story', 'motorcycle', 'bikes'],
  };
}

export default function WebStoryPage({ params }: Props) {
  const story = webStories[params.slug as keyof typeof webStories];

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button - positioned absolutely */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/web-stories"
          className="inline-flex items-center text-white bg-black bg-opacity-50 hover:bg-opacity-70 px-3 py-2 rounded-lg transition-colors"
        >
          <FiChevronLeft className="mr-1" />
          Back
        </Link>
      </div>

      {/* Web Story Viewer */}
      <WebStoryViewer story={story} />
    </div>
  );
}