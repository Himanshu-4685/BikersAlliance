'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrendingUp, FiMapPin, FiDollarSign, FiDroplet, FiCalendar } from 'react-icons/fi';

// Sample bike data for the tool
const sampleBikes = [
  {
    id: 1,
    name: 'Hero Splendor Plus',
    price: '₹74,856',
    mileage: '70 kmpl',
    image: '/images/bikes/splendor-plus.jpg'
  },
  {
    id: 2,
    name: 'Honda Activa 6G',
    price: '₹76,684',
    mileage: '60 kmpl',
    image: '/images/bikes/activa-6g.jpg'
  },
  {
    id: 3,
    name: 'TVS Raider',
    price: '₹98,389',
    mileage: '67 kmpl',
    image: '/images/bikes/tvs-raider.jpg'
  },
  {
    id: 4,
    name: 'Royal Enfield Hunter 350',
    price: '₹1.50 Lakh',
    mileage: '36 kmpl',
    image: '/images/bikes/hunter-350.jpg'
  },
  {
    id: 5,
    name: 'Royal Enfield Classic 350',
    price: '₹1.93 Lakh',
    mileage: '35 kmpl',
    image: '/images/bikes/classic-350.jpg'
  }
];

const bestMileageBikes = [
  { name: 'Hero Splendor Plus', mileage: '70 kmpl', price: '₹74,856' },
  { name: 'Bajaj Platina 110', mileage: '84 kmpl', price: '₹64,301' },
  { name: 'Honda SP 125', mileage: '65 kmpl', price: '₹81,567' }
];

const twoWheelerNews = [
  {
    title: 'Top Scooter Choices Available For Rs 1 Lakh in India',
    description: 'There are 16 scooters between Rs 50000-100000 price range available in India. Suzuki Access 125 starts at Rs 50000.',
    date: 'Dec 27, 2024',
    image: '/images/news/scooter-news.jpg'
  },
  {
    title: 'QJ Motor SRK 400 And Suzuki GSX-8R Road Tests Slated and More',
    description: 'India has been experiencing noteworthy motorcycle introductions over the past few months and the upcoming year of 2025 too...',
    date: 'Dec 15, 2024',
    image: '/images/news/qj-motor-news.jpg'
  },
  {
    title: 'BREAKING: Bajaj Chetak Slashed and MG to Debut Diesel EMI',
    description: 'Bajaj Chetak launched the new electric scooter with improved battery technology and extended range.',
    date: 'Dec 10, 2024',
    image: '/images/news/bajaj-chetak-news.jpg'
  }
];

const bikeCategories = [
  { name: 'Commuter Bikes', icon: '🏍️', slug: 'commuter' },
  { name: 'Sports Bikes', icon: '🏁', slug: 'sports-bike' },
  { name: 'Cruiser Bikes', icon: '🛣️', slug: 'cruiser' },
  { name: 'Electric Bikes', icon: '⚡', slug: 'electric' },
  { name: 'Adventure Bikes', icon: '🏔️', slug: 'adventure' },
  { name: 'Scooters', icon: '🛵', slug: 'scooter' }
];

export default function BikeFuelCalculatorPage() {
  const [dailyDistance, setDailyDistance] = useState(30);
  const [fuelPrice, setFuelPrice] = useState(110);
  const [selectedBikeMileage, setSelectedBikeMileage] = useState(50);
  const [timeFrame, setTimeFrame] = useState('monthly'); // daily, monthly, yearly
  
  const [fuelCost, setFuelCost] = useState(0);
  const [fuelConsumed, setFuelConsumed] = useState(0);

  const calculateFuelCost = () => {
    let days = 1;
    if (timeFrame === 'monthly') days = 30;
    if (timeFrame === 'yearly') days = 365;

    const totalDistance = dailyDistance * days;
    const fuelNeeded = totalDistance / selectedBikeMileage;
    const totalCost = fuelNeeded * fuelPrice;

    setFuelConsumed(parseFloat(fuelNeeded.toFixed(2)));
    setFuelCost(parseFloat(totalCost.toFixed(2)));
  };

  useEffect(() => {
    calculateFuelCost();
  }, [dailyDistance, fuelPrice, selectedBikeMileage, timeFrame]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find the total fuel cost of your Bike
            </h1>
            <p className="text-xl text-red-100 mb-8">
              Calculate how much you'll spend on fuel based on your daily riding habits
            </p>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Fuel Cost Calculator */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FiDroplet className="w-6 h-6 mr-3 text-red-500" />
                    Fuel Cost Calculator
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Controls */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          How often you use your bike
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['daily', 'monthly', 'yearly'].map((period) => (
                            <button
                              key={period}
                              onClick={() => setTimeFrame(period)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                timeFrame === period
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Distance per day (km)
                        </label>
                        <input
                          type="number"
                          value={dailyDistance}
                          onChange={(e) => setDailyDistance(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          min="1"
                          max="500"
                        />
                        <input
                          type="range"
                          min="1"
                          max="200"
                          value={dailyDistance}
                          onChange={(e) => setDailyDistance(Number(e.target.value))}
                          className="w-full mt-2 accent-red-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 km</span>
                          <span>200 km</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mileage (km/l)
                        </label>
                        <input
                          type="number"
                          value={selectedBikeMileage}
                          onChange={(e) => setSelectedBikeMileage(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          min="10"
                          max="100"
                        />
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={selectedBikeMileage}
                          onChange={(e) => setSelectedBikeMileage(Number(e.target.value))}
                          className="w-full mt-2 accent-red-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>20 kmpl</span>
                          <span>80 kmpl</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fuel price (₹/litre)
                        </label>
                        <input
                          type="number"
                          value={fuelPrice}
                          onChange={(e) => setFuelPrice(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          min="50"
                          max="200"
                        />
                      </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                      <div className="bg-red-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-800 mb-4">
                          {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Fuel Cost
                        </h3>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          ₹{fuelCost.toLocaleString('en-IN')}
                        </div>
                        <p className="text-sm text-red-700">
                          Based on {dailyDistance} km per day
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Fuel Needed</h4>
                          <div className="text-lg font-semibold text-gray-900">
                            {fuelConsumed} L
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Distance</h4>
                          <div className="text-lg font-semibold text-gray-900">
                            {timeFrame === 'daily' ? dailyDistance : 
                             timeFrame === 'monthly' ? dailyDistance * 30 : 
                             dailyDistance * 365} km
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Cost per km</h4>
                        <div className="text-lg font-semibold text-green-900">
                          ₹{(fuelPrice / selectedBikeMileage).toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Monthly Savings vs Car</h4>
                        <div className="text-lg font-semibold text-blue-900">
                          ₹{((fuelPrice / 15) * dailyDistance * 30 - (fuelPrice / selectedBikeMileage) * dailyDistance * 30).toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-blue-700 mt-1">Assuming car gives 15 kmpl</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Mileage Bikes */}
                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                  <h2 className="text-2xl font-bold mb-6">Best Mileage Bikes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {bestMileageBikes.map((bike, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Bike Image</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{bike.name}</h3>
                          <p className="text-red-600 font-medium text-sm mb-1">{bike.price}</p>
                          <p className="text-green-600 font-medium text-sm">{bike.mileage}</p>
                          <button className="w-full mt-3 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm">
                            View September Offers
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Two Wheeler Latest News */}
                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                  <h2 className="text-2xl font-bold mb-6">Two Wheeler Latest News</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {twoWheelerNews.map((news, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">News Image</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{news.title}</h3>
                          <p className="text-gray-600 text-xs mb-3 line-clamp-3">{news.description}</p>
                          <p className="text-gray-500 text-xs">{news.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Popular Bikes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Trending Bikes</h3>
                  <div className="space-y-4">
                    {sampleBikes.map((bike) => (
                      <div key={bike.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">{bike.name}</h4>
                          <p className="text-xs text-red-600">{bike.price}</p>
                          <p className="text-xs text-green-600">{bike.mileage}</p>
                        </div>
                      </div>
                    ))}
                    <Link href="/bikes" className="block w-full text-red-500 text-sm font-medium hover:text-red-600 text-center py-2">
                      View All Bikes
                    </Link>
                  </div>
                </div>

                {/* Search by Body Type */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Search Bikes by Body Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {bikeCategories.map((category, index) => (
                      <Link 
                        key={index} 
                        href={`/bikes/type/${category.slug}`}
                        className="p-3 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center"
                      >
                        <div className="text-2xl mb-1">{category.icon}</div>
                        <span className="text-xs font-medium text-gray-900">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Tools</h3>
                  <div className="space-y-3">
                    <Link href="/finance/emi-calculator" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <FiDollarSign className="inline w-4 h-4 mr-2 text-red-500" />
                      EMI Calculator
                    </Link>
                    <Link href="/compare" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <FiTrendingUp className="inline w-4 h-4 mr-2 text-red-500" />
                      Compare Bikes
                    </Link>
                    <Link href="/electric/charging-stations" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <FiMapPin className="inline w-4 h-4 mr-2 text-red-500" />
                      Charging Stations
                    </Link>
                    <Link href="/sell-bike" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <FiCalendar className="inline w-4 h-4 mr-2 text-red-500" />
                      Sell Your Bike
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}