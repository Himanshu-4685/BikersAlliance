import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiShare2 } from 'react-icons/fi';
import { FormattedBike } from '@/types/bike';

interface BikeGridProps {
  bikes: FormattedBike[];
  loading?: boolean;
}

export default function BikeGrid({ bikes, loading = false }: BikeGridProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (bikes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏍️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes found</h3>
        <p className="text-gray-600">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bikes.map((bike) => (
        <div key={bike.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="relative">
            <Image
              src={bike.image || '/images/default-bike.jpg'}
              alt={bike.name}
              width={400}
              height={250}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 right-3 flex space-x-2">
              <button 
                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                title="Add to favorites"
              >
                <FiHeart className="w-4 h-4" />
              </button>
              <button 
                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                title="Share bike"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center mb-2">
              {bike.brand.logo && (
                <Image
                  src={bike.brand.logo}
                  alt={bike.brand.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 mr-2"
                />
              )}
              <span className="text-sm text-gray-600">{bike.brand.name}</span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {bike.name}
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              {bike.specs.displacement && (
                <div>Engine: {bike.specs.displacement}</div>
              )}
              {bike.specs.mileage && (
                <div>Mileage: {bike.specs.mileage}</div>
              )}
              {bike.specs.bodyType && (
                <div>Type: {bike.specs.bodyType}</div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-gray-900">
                {formatPrice(bike.price)}
              </div>
              <Link
                href={`/bikes/${bike.slug}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}