'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Web Stories Data
const stories = [
  {
    id: 'top-adventure-bikes-under-2-lakhs',
    title: 'Top Adventure Bikes Under 2 Lakhs',
    image: '/images/stories/adventure-bikes.jpg',
    date: 'May 12, 2023'
  },
  {
    id: 'best-sports-bikes-in-india',
    title: 'Best Sports Bikes in India',
    image: '/images/stories/sports-bikes.jpg',
    date: 'May 10, 2023'
  },
  {
    id: 'upcoming-bikes-in-2023',
    title: 'Upcoming Bikes in 2023',
    image: '/images/stories/upcoming-bikes.jpg',
    date: 'May 8, 2023'
  },
  {
    id: 'best-mileage-bikes-in-india',
    title: 'Best Mileage Bikes in India',
    image: '/images/stories/mileage-bikes.jpg',
    date: 'May 5, 2023'
  },
  {
    id: 'new-electric-bikes-launching-soon',
    title: 'New Electric Bikes Launching Soon',
    image: '/images/stories/electric-bikes.jpg',
    date: 'May 3, 2023'
  }
];

export default function WebStories() {
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Slider Navigation */}
      <div className="absolute right-6 flex space-x-2 -top-12">
        <button 
          onClick={scrollLeft}
          className="flex items-center justify-center w-8 h-8 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={scrollRight}
          className="flex items-center justify-center w-8 h-8 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
        
      <div 
        ref={sliderRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {stories.map((story) => (
          <Link 
            key={story.id}
            href={`/web-stories/${story.id}`} 
            className="flex-none w-64 overflow-hidden transition-transform rounded-lg snap-start hover:scale-105"
          >
            <div className="relative h-96 bg-gradient-to-b from-black/20 to-black/60">
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover z-0"
                sizes="256px"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <div className="px-2 py-1 mb-2 text-xs font-medium text-white bg-primary rounded-full w-fit">
                  Story
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  {story.title}
                </h3>
                <p className="text-sm text-white/80">{story.date}</p>
              </div>
            </div>
          </Link>
        ))}
        
        <Link 
          href="/web-stories"
          className="flex-none w-64 flex flex-col items-center justify-center h-96 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-primary hover:bg-gray-50 transition-colors snap-start"
        >
          <div className="flex items-center justify-center w-12 h-12 mb-2 text-white rounded-full bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-primary">View All Stories</p>
        </Link>
      </div>
    </div>
  );
}