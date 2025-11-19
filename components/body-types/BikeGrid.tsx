import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiShare2, FiSettings, FiZap } from 'react-icons/fi';
import { FormattedBike, Bike } from '@/types/bike';
import BikeCard from '@/components/bikes/BikeCard';

interface BikeGridProps {
  bikes: FormattedBike[];
  loading?: boolean;
}

// Helper function to convert FormattedBike to standard Bike format
const formatBikeForCard = (formattedBike: FormattedBike): Bike => {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    return price.toLocaleString('en-IN');
  };

  return {
    id: formattedBike.id,
    name: formattedBike.name,
    slug: formattedBike.slug,
    image: formattedBike.image || '/images/default-bike.jpg',
    price: formatPrice(formattedBike.price),
    specs: {
      engine: formattedBike.specs.displacement || 'N/A',
      mileage: formattedBike.specs.mileage || 'N/A',
      power: formattedBike.specs.power || 'N/A'
    }
  };
};

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
        <div key={bike.id} className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 transition-shadow overflow-hidden">
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
            
            <Link href={`/bikes/${bike.slug}`} className="block">
              <h3 className="font-medium text-lg text-gray-900 mb-2 hover:text-primary line-clamp-2">
                {bike.name}
              </h3>
            </Link>
            
            <div className="mb-3 text-lg font-bold text-gray-900">
              ₹ {formatPrice(bike.price)}
            </div>
            
            {/* Specs - matching LatestBikes format */}
            <div className="grid grid-cols-3 gap-2 pt-3 mt-3 text-xs text-gray-500 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiSettings className="w-4 h-4 text-gray-400" />
                </div>
                <div className="font-medium">Engine</div>
                <div>{bike.specs.displacement || 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-4 h-4 text-red-500 font-bold">⛽</div>
                </div>
                <div className="font-medium">Mileage</div>
                <div>{bike.specs.mileage || 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiZap className="w-4 h-4 text-gray-400" />
                </div>
                <div className="font-medium">Power</div>
                <div>{bike.specs.power || 'N/A'}</div>
              </div>
            </div>
            
            {/* CTA */}
            <button className="w-full px-4 py-2 mt-4 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white">
              View Specifications & Price
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}