import Link from 'next/link';
import Image from 'next/image';
import BikeCard from '@/components/bikes/BikeCard';

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
      
      <div className="flex flex-wrap gap-4 mt-4">
        {bikes.map((bike) => {
          // Convert to BikeCard format
          const bikeData = {
            id: bike.id,
            name: bike.name,
            image: (bike.images && bike.images.length > 0) ? bike.images[0].url : bike.image || '/demo.avif',
            price: bike.price ? bike.price.toLocaleString('en-IN') : 'Price not available',
            specs: {
              engine: 'N/A',
              mileage: 'N/A',
              power: 'N/A'
            }
          };
          
          return (
            <BikeCard 
              key={bike.id}
              bike={bikeData}
              viewMode="grid"
              showBrand={false}
            />
          );
        })}
      </div>
    </div>
  );
}