import React from 'react';
import UsedBikesSection from '@/components/bikes/UsedBikesSection';

export const metadata = {
  title: 'Used Bikes | Bikers Alliance',
  description: 'Find trusted used bikes near you at Bikers Alliance',
};

export default function UsedBikesPage() {
  return (
    <div className="py-8">
      <div className="container">
        <h1 className="mb-6 text-3xl font-bold">Used Bikes</h1>
        
        <div className="p-6 bg-white border rounded-lg shadow-sm mb-8">
          <p className="text-lg text-gray-700">
            Find trusted used bikes from verified sellers across India. Our platform ensures that you get the best deals on pre-owned motorcycles with complete transparency.
          </p>
        </div>
      </div>
      
      <UsedBikesSection />
    </div>
  );
}