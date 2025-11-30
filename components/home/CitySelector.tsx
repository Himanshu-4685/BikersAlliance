'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Cities Data
const popularCities = [
  { id: 'delhi', name: 'Delhi' },
  { id: 'mumbai', name: 'Mumbai' },
  { id: 'bangalore', name: 'Bangalore' },
  { id: 'hyderabad', name: 'Hyderabad' },
  { id: 'chennai', name: 'Chennai' },
  { id: 'kolkata', name: 'Kolkata' },
  { id: 'pune', name: 'Pune' },
  { id: 'ahmedabad', name: 'Ahmedabad' }
];

// State wise cities
const stateWiseCities = [
  {
    state: 'Maharashtra',
    cities: [
      { id: 'mumbai', name: 'Mumbai' },
      { id: 'pune', name: 'Pune' },
      { id: 'nagpur', name: 'Nagpur' },
      { id: 'thane', name: 'Thane' },
      { id: 'nashik', name: 'Nashik' }
    ]
  },
  {
    state: 'Delhi NCR',
    cities: [
      { id: 'delhi', name: 'Delhi' },
      { id: 'gurgaon', name: 'Gurgaon' },
      { id: 'noida', name: 'Noida' },
      { id: 'faridabad', name: 'Faridabad' },
      { id: 'ghaziabad', name: 'Ghaziabad' }
    ]
  },
  {
    state: 'Karnataka',
    cities: [
      { id: 'bangalore', name: 'Bangalore' },
      { id: 'mysore', name: 'Mysore' },
      { id: 'mangalore', name: 'Mangalore' },
      { id: 'hubli', name: 'Hubli' },
      { id: 'belgaum', name: 'Belgaum' }
    ]
  },
  {
    state: 'Tamil Nadu',
    cities: [
      { id: 'chennai', name: 'Chennai' },
      { id: 'coimbatore', name: 'Coimbatore' },
      { id: 'madurai', name: 'Madurai' },
      { id: 'trichy', name: 'Trichy' },
      { id: 'salem', name: 'Salem' }
    ]
  },
  {
    state: 'Telangana',
    cities: [
      { id: 'hyderabad', name: 'Hyderabad' },
      { id: 'warangal', name: 'Warangal' },
      { id: 'nizamabad', name: 'Nizamabad' },
      { id: 'khammam', name: 'Khammam' },
      { id: 'karimnagar', name: 'Karimnagar' }
    ]
  }
];

export default function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<{id: string, name: string}[]>([]);
  
  // Handle search functionality
  useEffect(() => {
    if (searchQuery) {
      // Flatten all cities from stateWiseCities
      const allCities = stateWiseCities.reduce((acc, state) => {
        return [...acc, ...state.cities];
      }, [] as {id: string, name: string}[]);
      
      // Filter cities based on search query
      const filtered = allCities.filter(city => 
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [searchQuery]);
  
  return (
    <section className="py-10 bg-white">
      <div className="container px-4 mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Find Bikes By City</h2>
          <p className="text-gray-600">Choose your city to see bikes available with price & dealers near you</p>
        </div>
        
        {/* City Selector */}
        <div className="relative mb-8">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Select your city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setIsOpen(true)}
          />
          
          {/* Dropdown for city selection */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">Popular Cities</h3>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {popularCities.map((city) => (
                    <Link
                      key={city.id}
                      href={`/bikes-in-${city.id}`}
                      className="px-3 py-2 text-center text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-primary hover:text-white"
                      style={{fontFamily: 'Lato, sans-serif, Arial', fontSize: '13px'}}
                      onClick={() => setIsOpen(false)}
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Search Results */}
              {searchQuery && filteredCities.length > 0 && (
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">Search Results</h3>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {filteredCities.map((city) => (
                      <Link
                        key={city.id}
                        href={`/bikes-in-${city.id}`}
                        className="px-3 py-2 text-center text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-primary hover:text-white"
                        style={{fontFamily: 'Lato, sans-serif, Arial', fontSize: '13px'}}
                        onClick={() => setIsOpen(false)}
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* State-wise Cities */}
              <div className="max-h-64 overflow-y-auto">
                {stateWiseCities.map((state) => (
                  <div key={state.state} className="p-3 border-b border-gray-200 last:border-b-0">
                    <h3 className="font-medium text-gray-700">{state.state}</h3>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {state.cities.map((city) => (
                        <Link
                          key={city.id}
                          href={`/bikes-in-${city.id}`}
                          className="px-3 py-2 text-center text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-primary hover:text-white"
                          style={{fontFamily: 'Lato, sans-serif, Arial', fontSize: '13px'}}
                          onClick={() => setIsOpen(false)}
                        >
                          {city.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Close button */}
              <div className="p-3 text-center bg-gray-50">
                <button
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Popular Cities Grid */}
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-900">Popular Cities</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {popularCities.map((city) => (
              <Link
                key={city.id}
                href={`/bikes-in-${city.id}`}
                className="px-4 py-3 text-center text-gray-700 transition-colors border border-gray-200 rounded-md hover:bg-primary hover:text-white hover:border-primary"
                style={{fontFamily: 'Lato, sans-serif, Arial', fontSize: '13px'}}
              >
                {city.name}
              </Link>
            ))}
            <Link
              href="/all-cities"
              className="flex items-center justify-center px-4 py-3 text-center text-primary transition-colors border border-gray-200 rounded-md hover:bg-primary hover:text-white hover:border-primary"
              style={{fontFamily: 'Lato, sans-serif, Arial', fontSize: '13px'}}
            >
              <span>View All Cities</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}