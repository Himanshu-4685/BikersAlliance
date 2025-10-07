'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';

export default function Hero() {
  const [bikeType, setBikeType] = useState('new');
  const [searchBy, setSearchBy] = useState('budget');
  
  return (
    <section className="relative h-[500px] bg-gray-50">
      <div className="container h-full">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          {/* Hero Background */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/hero/TVS XL100.avif" 
              alt="Featured Motorcycle"
              fill
              className="object-cover"
              style={{ objectPosition: 'center right' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          </div>
          
          {/* Form Container - Styled exactly as per image */}
          <div 
            className="absolute z-100" 
            style={{
              left: '90px',
              top: '54px',
              width: '348px',
              height: 'auto',
              padding: '19px 24px 24px',
              borderRadius: '16px',
              boxShadow: '0px 0px 70px 0px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              fontFamily: 'Lato, sans-serif, Arial',
              fontSize: '13px',
              lineHeight: '19.5px',
              fontWeight: 400,
              position: 'absolute',
              display: 'block',
              boxSizing: 'border-box',
              unicodeBidi: 'isolate'
            }}
          >
            <h2 className="text-2xl font-medium mb-4">Search the right bike</h2>
            
            {/* New/Used Toggle */}
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => setBikeType('new')}
                className={`px-5 py-2.5 text-sm font-medium rounded-md mr-2 ${
                  bikeType === 'new'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ minWidth: '110px' }}
              >
                New Bike
              </button>
              <button
                type="button"
                onClick={() => setBikeType('used')}
                className={`px-5 py-2.5 text-sm font-medium rounded-md ${
                  bikeType === 'used'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ minWidth: '110px' }}
              >
                Used Bike
              </button>
            </div>

            {/* Radio Buttons */}
            <div className="mb-3">
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <input
                    id="by-brand"
                    name="search-by"
                    type="radio"
                    checked={searchBy === 'brand'}
                    onChange={() => setSearchBy('brand')}
                    className="h-4 w-4 text-[#D02F2F] border-gray-300 focus:ring-[#D02F2F]"
                  />
                  <label htmlFor="by-brand" className="ml-2 text-sm text-gray-900">
                    By Brand
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="by-budget"
                    name="search-by"
                    type="radio"
                    checked={searchBy === 'budget'}
                    onChange={() => setSearchBy('budget')}
                    className="h-4 w-4 text-[#D02F2F] border-gray-300 focus:ring-[#D02F2F]"
                  />
                  <label htmlFor="by-budget" className="ml-2 text-sm text-gray-900">
                    By Budget
                  </label>
                </div>
              </div>
            </div>

            {/* Form Selects */}
            <form>
              <div className="space-y-3">
                {searchBy === 'brand' ? (
                  <>
                    <div>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D02F2F] focus:border-[#D02F2F] text-gray-500">
                        <option value="">Select Brand</option>
                        <option value="honda">Honda</option>
                        <option value="hero">Hero</option>
                        <option value="bajaj">Bajaj</option>
                        <option value="tvs">TVS</option>
                        <option value="royal-enfield">Royal Enfield</option>
                      </select>
                    </div>
                    
                    <div>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D02F2F] focus:border-[#D02F2F] text-gray-500">
                        <option value="">Select Model</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-500">
                        <option value="">Select Budget</option>
                        <option value="under-50000">Under ₹50,000</option>
                        <option value="50000-100000">₹50,000 - ₹1 Lakh</option>
                        <option value="100000-150000">₹1 Lakh - ₹1.5 Lakh</option>
                        <option value="above-150000">Above ₹1.5 Lakh</option>
                      </select>
                    </div>
                    
                    <div>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-500">
                        <option value="">Select Type</option>
                        <option value="standard">Standard</option>
                        <option value="sports">Sports</option>
                        <option value="cruiser">Cruiser</option>
                        <option value="adventure">Adventure</option>
                        <option value="scooter">Scooter</option>
                      </select>
                    </div>
                  </>
                )}
                
                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#D02F2F] text-white rounded-md font-medium hover:bg-[#B82929] transition duration-150"
                >
                  Search
                </button>
              </div>
              
              {/* Advanced Search Link */}
              <div className="mt-3 text-right">
                <a href="#" className="text-gray-500 text-sm hover:text-[#D02F2F]">
                  Advanced Search →
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}