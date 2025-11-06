'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiShare2 } from 'react-icons/fi';

interface StoryPage {
  id: number;
  image: string;
  title: string;
  text: string;
}

interface WebStory {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  publishedAt: string;
  category: string;
  pages: StoryPage[];
}

interface WebStoryViewerProps {
  story: WebStory;
}

export default function WebStoryViewer({ story }: WebStoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-progress functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentPage < story.pages.length - 1) {
            setCurrentPage(currentPage + 1);
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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentStoryPage.image}
          alt={currentStoryPage.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-40">
        <div className="flex space-x-1">
          {story.pages.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                style={{
                  width: index < currentPage ? '100%' : 
                         index === currentPage ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-12 left-4 right-4 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">BA</span>
          </div>
          <div>
            <div className="text-white font-semibold">BikersAlliance</div>
            <div className="text-gray-300 text-sm">{story.category}</div>
          </div>
        </div>
        
        <button 
          onClick={togglePlayPause}
          className="text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex z-30">
        {/* Left side - Previous */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={goToPrevPage}
        />
        
        {/* Right side - Next */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={goToNextPage}
        />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-40">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          {currentStoryPage.title}
        </h1>
        <p className="text-lg leading-relaxed mb-6">
          {currentStoryPage.text}
        </p>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40">
        {currentPage > 0 && (
          <button
            onClick={goToPrevPage}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
          >
            <FiChevronLeft size={24} />
          </button>
        )}
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40">
        {currentPage < story.pages.length - 1 && (
          <button
            onClick={goToNextPage}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
          >
            <FiChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Share Button */}
      <div className="absolute bottom-6 right-6 z-40">
        <button className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all">
          <FiShare2 size={20} />
        </button>
      </div>

      {/* Page Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 flex space-x-2">
        {story.pages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentPage ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}