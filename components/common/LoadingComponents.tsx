'use client';

import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  color = 'indigo-600',
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-2 border-t-${color} border-r-${color} border-b-transparent border-l-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
});

export default LoadingSpinner;

// Skeleton components for different UI elements
export const SkeletonText = memo(function SkeletonText({
  lines = 1,
  className = ''
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          } ${i > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </div>
  );
});

export const SkeletonCard = memo(function SkeletonCard({
  className = ''
}: {
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
      </div>
      <div className="mt-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
});

export const SkeletonTable = memo(function SkeletonTable({
  rows = 5,
  columns = 4
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 mb-3">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-8 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
});