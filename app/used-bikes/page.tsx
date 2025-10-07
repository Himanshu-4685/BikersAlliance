import React from 'react';
import UsedBikesSection from '@/components/bikes/UsedBikesSection';

export const metadata = {
  title: 'Used Bikes | Bikers Alliance',
  description: 'Find trusted used bikes near you at Bikers Alliance',
};

export default function UsedBikesPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Used Bikes</h1>
      
      <div className="p-6 bg-white border rounded-lg shadow-sm mb-8">
        <p className="text-lg text-gray-700">
          Find trusted used bikes from verified sellers across India. Our platform ensures that you get the best deals on pre-owned motorcycles with complete transparency.
        </p>
      </div>
      
      <div>
        <h2 className="mb-6 text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Browse Used Bikes by City</h2>
        <UsedBikesSection />
      </div>
    </div>
  );
}