import Link from 'next/link';
import Image from 'next/image';

// Types
interface SimilarBike {
  id: string;
  name: string;
  slug: string;
  brand?: {
    name: string;
  };
  images?: {
    url: string;
  }[];
  image?: string;
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
            href={`/bikes/${bike.id}`} 
            className="overflow-hidden transition-shadow bg-white border rounded-lg hover:shadow-md"
          >
            {/* Bike Image */}
            <div className="relative h-40 bg-gray-100">
              {(bike.images && bike.images.length > 0) || bike.image ? (
                <Image
                  src={bike.images && bike.images.length > 0 ? bike.images[0].url : bike.image!}
                  alt={bike.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              ) : (
                <Image
                  src="/demo.avif"
                  alt={bike.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              )}
            </div>
            
            <div className="p-3">
              {/* Bike Name */}
              <h3 className="font-medium">{bike.name}</h3>
              {bike.brand && <p className="text-sm text-gray-500">{bike.brand.name}</p>}
              
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