import Image from 'next/image';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading indicator */}
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>

      {/* Header Skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 mx-auto w-64"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-80"></div>
          </div>
        </div>
      </div>

      {/* Search and Controls Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-80"></div>
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Brands Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-16 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}