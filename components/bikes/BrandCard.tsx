'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  logoUrl?: string;
  country?: string;
  count?: number;
  _count?: {
    models: number;
  };
}

interface BrandCardProps {
  brand: Brand;
  viewMode?: 'grid' | 'list';
}

export default function BrandCard({ brand, viewMode = 'grid' }: BrandCardProps) {
  return (
    <div className={viewMode === 'grid' 
      ? "bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 p-6 text-center"
      : "bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 flex items-center p-4"
    }>
      <Link href={`/brands/${brand.slug}`} className={viewMode === 'grid' ? "block" : "flex items-center w-full"}>
        <div className={viewMode === 'grid' ? "mb-4" : "flex-shrink-0 mr-4"}>
          <Image
            src={brand.logoUrl || brand.logo || '/demo.avif'}
            alt={`${brand.name} logo`}
            width={viewMode === 'grid' ? 80 : 60}
            height={viewMode === 'grid' ? 80 : 60}
            className="rounded-lg object-contain bg-gray-100 p-2 mx-auto"
          />
        </div>
        <div className={viewMode === 'grid' ? "" : "flex-1"}>
          <h3 className={`font-semibold text-gray-900 ${viewMode === 'grid' ? 'mb-2' : 'mb-1'}`}>
            {brand.name}
          </h3>
          {brand.country && (
            <p className="text-sm text-gray-500 mb-2">
              {brand.country}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {brand._count?.models || brand.count || 0} models
          </p>
        </div>
      </Link>
    </div>
  );
}