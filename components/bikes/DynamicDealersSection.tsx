'use client';

import { useState, useEffect } from 'react';
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiSearch,
  FiLoader,
  FiNavigation,
  FiClock
} from 'react-icons/fi';

// Types
interface Dealer {
  dealer_id: number;
  name: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

export default function DynamicDealersSection() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showDealers, setShowDealers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];



  // Search dealers
  const searchDealers = async () => {
    if (!searchQuery.trim() && !selectedCity && !selectedState) {
      setError('Please enter a search term, city, or state');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedCity) params.append('city', selectedCity);
      if (selectedState) params.append('state', selectedState);

      const response = await fetch(`/api/dealers/search?${params}`);
      const result = await response.json();

      if (result.success) {
        setDealers(result.data);
        setShowDealers(true);
        if (result.data.length === 0) {
          setError('No dealers found for your search criteria');
        }
      } else {
        setError(result.error || 'Failed to search dealers');
      }
    } catch (error) {
      console.error('Error searching dealers:', error);
      setError('Failed to search dealers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load all dealers initially
  const loadAllDealers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dealers?limit=50');
      const result = await response.json();

      if (result.success) {
        setDealers(result.data.dealers);
        setShowDealers(true);
      } else {
        setError(result.error || 'Failed to load dealers');
      }
    } catch (error) {
      console.error('Error loading dealers:', error);
      setError('Failed to load dealers. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Reset search
  const resetSearch = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedState('');
    setShowDealers(false);
    setDealers([]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Authorized Dealers</h2>
      
      {/* Search Section */}
      <div className="space-y-4 mb-6">
        {/* Search Input */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by dealer name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchDealers()}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="Enter city name"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select state</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={searchDealers}
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <FiLoader className="w-4 h-4 animate-spin" />}
            <FiSearch className="w-4 h-4" />
            <span>Search Dealers</span>
          </button>

          <button
            onClick={loadAllDealers}
            disabled={loading}
            className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiMapPin className="w-4 h-4" />
            <span>Show All Dealers</span>
          </button>

          {(showDealers || error) && (
            <button
              onClick={resetSearch}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <FiLoader className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Searching for dealers...</p>
        </div>
      )}

      {/* Dealers Results */}
      {showDealers && !loading && dealers.length > 0 && (
        <div>
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              Found {dealers.length} dealer{dealers.length !== 1 ? 's' : ''} for your search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dealers.map((dealer) => (
              <div
                key={dealer.dealer_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {dealer.name}
                </h3>

                {/* Address */}
                <div className="flex items-start space-x-2 mb-3">
                  <FiMapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    {dealer.address && (
                      <div>{dealer.address}</div>
                    )}
                    <div>
                      {dealer.city}, {dealer.state}
                      {dealer.pincode && ` - ${dealer.pincode}`}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  {dealer.phone && (
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${dealer.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {dealer.phone}
                      </a>
                    </div>
                  )}

                  {dealer.email && (
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${dealer.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {dealer.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 flex items-center justify-center space-x-1">
                    <FiNavigation className="w-4 h-4" />
                    <span>Get Directions</span>
                  </button>
                  
                  {dealer.phone && (
                    <button className="flex-1 border border-primary text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary-50 flex items-center justify-center space-x-1">
                      <FiPhone className="w-4 h-4" />
                      <span>Call Now</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default State - No Search Performed */}
      {!showDealers && !loading && (
        <div className="text-center py-8">
          <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Find Authorized Dealers Near You
          </h3>
          <p className="text-gray-600 mb-4">
            Search for dealers by location or view all available dealers
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <FiClock className="w-4 h-4" />
              <span>Real-time dealer information</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}