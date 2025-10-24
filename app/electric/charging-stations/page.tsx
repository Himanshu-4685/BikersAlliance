'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiMapPin, FiClock, FiPhone, FiSearch, FiFilter } from 'react-icons/fi';

// Sample charging station data
const chargingStations = [
  {
    id: 1,
    name: 'Shell Recharge Delhi',
    location: 'Connaught Place, New Delhi',
    state: 'Delhi',
    city: 'New Delhi',
    address: 'Shop No. 12, Connaught Place, New Delhi - 110001',
    phone: '+91 9876543210',
    timing: '24 Hours',
    connectorTypes: ['Type 2', 'CCS', 'CHAdeMO'],
    chargingSpeed: '50kW',
    status: 'Available',
    pricing: '₹12/kWh',
    amenities: ['Parking', 'Restroom', 'Cafe']
  },
  {
    id: 2,
    name: 'Tata Power EZ Charge',
    location: 'Bandra West, Mumbai',
    state: 'Maharashtra',
    city: 'Mumbai',
    address: 'Linking Road, Bandra West, Mumbai - 400050',
    phone: '+91 9876543211',
    timing: '6 AM - 11 PM',
    connectorTypes: ['Type 2', 'CCS'],
    chargingSpeed: '22kW',
    status: 'Available',
    pricing: '₹10/kWh',
    amenities: ['Parking', 'Shopping Mall']
  },
  {
    id: 3,
    name: 'Ather Grid Charging',
    location: 'Electronic City, Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    address: 'Electronic City Phase 1, Bangalore - 560100',
    phone: '+91 9876543212',
    timing: '24 Hours',
    connectorTypes: ['Type 2', 'Ather Connector'],
    chargingSpeed: '6kW',
    status: 'Occupied',
    pricing: '₹8/kWh',
    amenities: ['Parking', 'Cafe', 'Security']
  },
  {
    id: 4,
    name: 'Hero Electric Station',
    location: 'Anna Salai, Chennai',
    state: 'Tamil Nadu',
    city: 'Chennai',
    address: 'Anna Salai, Chennai - 600002',
    phone: '+91 9876543213',
    timing: '7 AM - 10 PM',
    connectorTypes: ['Type 2', 'Standard'],
    chargingSpeed: '15kW',
    status: 'Available',
    pricing: '₹9/kWh',
    amenities: ['Parking', 'Restroom']
  },
  {
    id: 5,
    name: 'BPCL Charge Zone',
    location: 'Gachibowli, Hyderabad',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'HITEC City, Gachibowli, Hyderabad - 500032',
    phone: '+91 9876543214',
    timing: '24 Hours',
    connectorTypes: ['Type 2', 'CCS', 'CHAdeMO'],
    chargingSpeed: '60kW',
    status: 'Available',
    pricing: '₹15/kWh',
    amenities: ['Parking', 'Restroom', 'Security', 'Cafe']
  },
  {
    id: 6,
    name: 'Fortum Charge Drive',
    location: 'Sector 62, Gurgaon',
    state: 'Haryana',
    city: 'Gurgaon',
    address: 'Cyber City, Sector 62, Gurgaon - 122102',
    phone: '+91 9876543215',
    timing: '24 Hours',
    connectorTypes: ['Type 2', 'CCS'],
    chargingSpeed: '50kW',
    status: 'Available',
    pricing: '₹13/kWh',
    amenities: ['Parking', 'Security', 'Office Complex']
  }
];

const states = ['All States', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Haryana'];
const cities = ['All Cities', 'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Gurgaon'];

export default function ChargingStationsPage() {
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStations, setFilteredStations] = useState(chargingStations);

  useEffect(() => {
    let filtered = chargingStations;

    if (selectedState !== 'All States') {
      filtered = filtered.filter(station => station.state === selectedState);
    }

    if (selectedCity !== 'All Cities') {
      filtered = filtered.filter(station => station.city === selectedCity);
    }

    if (searchTerm) {
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStations(filtered);
  }, [selectedState, selectedCity, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Electric Charging Stations
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Electric Charging stations in India
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Mumbai</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Delhi</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Gurgaon</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Pune</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Search Electric Charging Station in India
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                <FiFilter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charging Stations List */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">
                Electric Charging Stations ({filteredStations.length})
              </h3>
              <div className="text-sm text-gray-600">
                Showing {filteredStations.length} results
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStations.map((station) => (
                <div key={station.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {station.name}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        station.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {station.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{station.location}</p>
                          <p className="text-xs text-gray-600">{station.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-700">{station.timing}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-700">{station.phone}</span>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Charging Speed:</span>
                          <span className="text-sm text-gray-700">{station.chargingSpeed}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Pricing:</span>
                          <span className="text-sm text-gray-700">{station.pricing}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {station.connectorTypes.map((type, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {station.amenities.map((amenity, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredStations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiMapPin className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No charging stations found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}