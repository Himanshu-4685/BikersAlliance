'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bike } from '@/types/bike';
import { FiSettings, FiZap } from 'react-icons/fi';

interface BikeCardProps {
  bike: Bike;
  viewMode?: 'grid' | 'list';
  showBrand?: boolean;
  showNewLaunchTag?: boolean;
}

export default function BikeCard({ bike, viewMode = 'grid', showBrand = false, showNewLaunchTag = false }: BikeCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 flex p-4">
        <Link href={`/bikes/${bike.slug}`} className="flex w-full">
          <div className="flex-shrink-0 w-48">
            <Image
              src={bike.image}
              alt={bike.name}
              width={192}
              height={128}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {bike.name}
            </h3>
            <p className="text-red-600 font-bold text-lg mb-3">
              ₹{bike.price}
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <FiSettings className="w-3 h-3 mr-1" />
                  Engine:
                </span>
                <span className="font-medium">{bike.specs.engine}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="w-3 h-3 mr-1 text-red-500 text-xs font-bold">⛽</span>
                  Mileage:
                </span>
                <span className="font-medium">{bike.specs.mileage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <FiZap className="w-3 h-3 mr-1" />
                  Power:
                </span>
                <span className="font-medium">{bike.specs.power}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid view - matching LatestBikes format
  return (
    <div className="flex-none w-[270px] snap-start">
      <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
        {/* Bike Image */}
        <Link href={`/bikes/${bike.slug}`} className="block">
          <div className="relative h-48 overflow-hidden bg-gray-100">
            <Image
              src={bike.image}
              alt={bike.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 270px"
            />
            {showNewLaunchTag && (
              <div className="absolute top-0 left-0 px-2 py-1 text-xs font-medium text-white bg-green-500">
                New Launch
              </div>
            )}
          </div>
        </Link>
        
        {/* Bike Info */}
        <div className="p-4">
          <Link href={`/bikes/${bike.slug}`} className="block">
            <h3 className="mb-2 text-lg font-medium text-gray-900 hover:text-primary">
              {bike.name}
            </h3>
          </Link>
          <div className="mb-3 text-lg font-bold text-gray-900">
            ₹ {bike.price}
          </div>
          
          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 pt-3 mt-3 text-xs text-gray-500 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FiSettings className="w-4 h-4 text-gray-400" />
              </div>
              <div className="font-medium">Engine</div>
              <div>{bike.specs.engine}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="w-4 h-4 text-red-500 font-bold">⛽</div>
              </div>
              <div className="font-medium">Mileage</div>
              <div>{bike.specs.mileage}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FiZap className="w-4 h-4 text-gray-400" />
              </div>
              <div className="font-medium">Power</div>
              <div>{bike.specs.power}</div>
            </div>
          </div>
          
          {/* CTA */}
          <button className="w-full px-4 py-2 mt-4 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white">
            View Specifications & Price
          </button>
        </div>
      </div>
    </div>
  );
}