import Link from 'next/link';
import Image from 'next/image';

// Types
interface SimilarBike {
  id: string;
  name: string;
  slug: string;
  brand: {
    name: string;
  };
  images: {
    url: string;
  }[];
  price?: number;
}

interface SimilarBikesSectionProps {
  bikes: SimilarBike[];
  title?: string;
}

export default function SimilarBikesSection({
  bikes,
  title = "Similar Bikes"
}: SimilarBikesSectionProps) {
  if (!bikes || bikes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>{title}</h2>
      
      <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
        {bikes.map((bike) => (
          <Link 
            key={bike.id} 
            href={`/bikes/${bike.slug}`} 
            className="overflow-hidden transition-shadow bg-white border rounded-lg hover:shadow-md"
          >
            {/* Bike Image */}
            <div className="relative h-40 bg-gray-100">
              {bike.images && bike.images.length > 0 ? (
                <Image
                  src={bike.images[0].url}
                  alt={bike.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <p className="text-gray-400">No image</p>
                </div>
              )}
            </div>
            
            <div className="p-3">
              {/* Bike Name */}
              <h3 className="font-medium">{bike.name}</h3>
              <p className="text-sm text-gray-500">{bike.brand.name}</p>
              
              {/* Price */}
              <p className="mt-2 font-semibold">
                {bike.price 
                  ? `₹ ${bike.price.toLocaleString('en-IN')}*` 
                  : 'Price not available'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}