'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight, FiShare2, FiX } from 'react-icons/fi';

interface StoryPage {
  image_url: string;
  caption?: string;
}

interface WebStory {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  published_at: string;
  category: string;
  pages: StoryPage[];
}

interface WebStoryViewerProps {
  story: WebStory;
}

export default function WebStoryViewer({ story }: WebStoryViewerProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [router]);

  // Auto-progress functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentPage < story.pages.length - 1) {
            setCurrentPage(currentPage + 1);
            setImageError(false); // Reset image error for new page
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + 1;
      });
    }, 50); // Progress every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [currentPage, story.pages.length, isPlaying]);

  // Reset image error when page changes
  useEffect(() => {
    setImageError(false);
  }, [currentPage]);

  const goToNextPage = () => {
    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setProgress(0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setProgress(0);
  };

  const currentStoryPage = story.pages[currentPage];

  if (!currentStoryPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-xl mb-2">Story not found</h2>
          <p className="text-gray-400">This story may be unavailable or corrupted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Mobile: Full screen, Desktop: Centered with max width */}
      <div className="relative w-full h-full md:w-96 md:h-[700px] md:rounded-2xl overflow-hidden bg-black shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          {!imageError ? (
            <Image
              src={currentStoryPage.image_url}
              alt={currentStoryPage.caption || story.title}
              fill
              className="object-cover"
              priority
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl mb-4">🏍️</div>
                <p className="text-lg font-medium">BikerAlliance</p>
                <p className="text-sm opacity-75">Loading story...</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        </div>

        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50">
          <div className="flex space-x-1">
            {story.pages.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                  style={{
                    width: index < currentPage ? '100%' : index === currentPage ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Story Header */}
        <div className="absolute top-12 left-4 right-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BA</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm drop-shadow-lg">BikersAlliance</p>
                <p className="text-white/90 text-xs drop-shadow-lg">{story.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={togglePlayPause}
                className="text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
              >
                <span className="text-sm">{isPlaying ? '⏸️' : '▶️'}</span>
              </button>
              <button 
                onClick={() => router.back()}
                className="text-white bg-black/60 hover:bg-black/80 p-2 rounded-full transition-colors border border-white/20"
                title="Close Story"
              >
                <FiX size={20} className="font-bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Tap Areas for Navigation */}
        <div className="absolute inset-0 flex z-30">
          {/* Left side - Previous */}
          <div 
            className="w-1/2 cursor-pointer flex items-center justify-start pl-4"
            onClick={goToPrevPage}
          >
            {currentPage > 0 && (
              <div className="md:hidden w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                <FiChevronLeft className="text-white" size={16} />
              </div>
            )}
          </div>
          
          {/* Right side - Next */}
          <div 
            className="w-1/2 cursor-pointer flex items-center justify-end pr-4"
            onClick={goToNextPage}
          >
            {currentPage < story.pages.length - 1 && (
              <div className="md:hidden w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                <FiChevronRight className="text-white" size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
          <div className="text-white">
            <h1 className="text-2xl md:text-xl font-bold mb-3 leading-tight drop-shadow-lg">
              {story.title}
            </h1>
            
            {currentStoryPage.caption && (
              <p className="text-base md:text-sm leading-relaxed mb-4 text-white/95 drop-shadow-lg">
                {currentStoryPage.caption}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  {story.category}
                </span>
                <span className="text-xs opacity-90 drop-shadow-lg">
                  {new Date(story.published_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              {/* Share Button */}
              <button className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors shadow-lg">
                <FiShare2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows (Desktop only) */}
        <div className="hidden md:flex">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40">
            {currentPage > 0 && (
              <button
                onClick={goToPrevPage}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all shadow-lg"
              >
                <FiChevronLeft size={24} />
              </button>
            )}
          </div>

          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40">
            {currentPage < story.pages.length - 1 && (
              <button
                onClick={goToNextPage}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all shadow-lg"
              >
                <FiChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Page Indicators */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-40 flex space-x-2">
          {story.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-2 h-2 rounded-full transition-all shadow-lg ${
                index === currentPage ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}