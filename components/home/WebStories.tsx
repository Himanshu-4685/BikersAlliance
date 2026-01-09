'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface WebStory {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string;
  published_at: string;
  category: string;
  featured: boolean;
}

export default function WebStories() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebStories();
  }, []);

  const fetchWebStories = async () => {
    try {
      const response = await fetch('/api/web-stories?limit=6&featured=false');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setStories(data.data);
      } else {
        console.error('Failed to fetch web stories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching web stories:', error);
    } finally {
      setLoading(false);
    }
  };
  
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
            <b>Web Stories</b>
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Loading stories...</span>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
            <b>Web Stories</b>
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No web stories available at the moment.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>Web Stories</b>
        </h2>
        <Link href="/web-stories" className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          View All Stories
        </Link>
      </div>
      
      {/* Carousel with side arrows */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className="absolute -left-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Stories Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-hidden scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {stories.map((story) => (
          <Link 
            key={story.id}
            href={`/web-stories/${story.slug}`} 
            className="flex-none w-64 overflow-hidden transition-transform rounded-lg snap-start hover:scale-105"
          >
            <div className="relative h-96 bg-gradient-to-b from-black/20 to-black/60">
              <Image
                src={story.cover_image_url}
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
                <p className="text-sm text-white/80">
                  {new Date(story.published_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
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
        
        {/* Right Arrow */}
        <button 
          onClick={scrollRight}
          className="absolute -right-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}