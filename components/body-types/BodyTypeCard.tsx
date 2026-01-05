import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { BodyType } from '@/types/bike';

interface BodyTypeCardProps {
  bodyType: BodyType;
  viewMode: 'grid' | 'list';
  icon?: string;
}

export default function BodyTypeCard({ bodyType, viewMode, icon = '🏍️' }: BodyTypeCardProps) {
  return (
    <Link
      href={`/bikes/type/${bodyType.slug}`}
      className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group ${
        viewMode === 'grid' ? 'p-6' : 'p-4'
      }`}
    >
      {viewMode === 'grid' ? (
        // Grid view
        <div className="text-center">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
            {bodyType.name}
          </h3>
          <p className="text-gray-600 text-sm">
            {bodyType.count} bike{bodyType.count !== 1 ? 's' : ''}
          </p>
          <div className="mt-4 text-blue-600 font-medium text-sm group-hover:underline">
            Explore {bodyType.name} bikes →
          </div>
        </div>
      ) : (
        // List view
        <div className="flex items-center space-x-4">
          <div className="text-3xl flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {bodyType.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {bodyType.count} bike{bodyType.count !== 1 ? 's' : ''} available
            </p>
          </div>
          <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        </div>
      )}
    </Link>
  );
}