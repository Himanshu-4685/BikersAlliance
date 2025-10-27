'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bike } from '@/types/bike';

interface BikeCardProps {
  bike: Bike;
  viewMode?: 'grid' | 'list';
  showBrand?: boolean;
}

export default function BikeCard({ bike, viewMode = 'grid', showBrand = false }: BikeCardProps) {
  return (
    <div className={viewMode === 'grid' 
      ? "bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
      : "bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 flex p-4"
    }>
      <Link href={`/bikes/${bike.slug}`} className={viewMode === 'grid' ? "block" : "flex w-full"}>
        <div className={viewMode === 'grid' ? "" : "flex-shrink-0 w-48"}>
          <Image
            src={bike.image}
            alt={bike.name}
            width={viewMode === 'grid' ? 300 : 192}
            height={viewMode === 'grid' ? 200 : 128}
            className={viewMode === 'grid' 
              ? "w-full h-48 object-cover rounded-t-lg"
              : "w-full h-32 object-cover rounded-lg"
            }
          />
        </div>
        <div className={viewMode === 'grid' ? "p-4" : "ml-4 flex-1"}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {bike.name}
          </h3>
          <p className="text-red-600 font-bold text-lg mb-3">
            ₹{bike.price}
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Engine:</span>
              <span className="font-medium">{bike.specs.engine}</span>
            </div>
            <div className="flex justify-between">
              <span>Mileage:</span>
              <span className="font-medium">{bike.specs.mileage}</span>
            </div>
            <div className="flex justify-between">
              <span>Power:</span>
              <span className="font-medium">{bike.specs.power}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}