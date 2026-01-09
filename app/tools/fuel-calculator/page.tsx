'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrendingUp, FiMapPin, FiDollarSign, FiDroplet, FiCalendar } from 'react-icons/fi';

// Interface for trending bikes from spotlight categories
interface TrendingBike {
  variant_id: number;
  variant_name: string;
  on_road_price: number;
  city_mileage: string;
  image_url: string;
  brand_name: string;
  variant_url: string;
  category: string;
}

// This will be fetched dynamically from API
interface BestMileageBike {
  variant_id: number;
  variant_name: string;
  on_road_price: number;
  city_mileage: string;
  image_url: string;
  brand_name: string;
  variant_url: string;
}

const twoWheelerNews = [
  {
    title: 'Top Scooter Choices Available For Rs 1 Lakh in India',
    description: 'There are 16 scooters between Rs 50000-100000 price range available in India. Suzuki Access 125 starts at Rs 50000.',
    date: 'Dec 27, 2024',
    image: '/images/news/news.avif'
  },
  {
    title: 'QJ Motor SRK 400 And Suzuki GSX-8R Road Tests Slated and More',
    description: 'India has been experiencing noteworthy motorcycle introductions over the past few months and the upcoming year of 2025 too...',
    date: 'Dec 15, 2024',
    image: '/images/news/news.avif'
  },
  {
    title: 'BREAKING: Bajaj Chetak Slashed and MG to Debut Diesel EMI',
    description: 'Bajaj Chetak launched the new electric scooter with improved battery technology and extended range.',
    date: 'Dec 10, 2024',
    image: '/images/news/news.avif'
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
  
  // State for best mileage bikes
  const [bestMileageBikes, setBestMileageBikes] = useState<BestMileageBike[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [bikeError, setBikeError] = useState<string | null>(null);
  
  // State for trending bikes from spotlight categories
  const [trendingBikes, setTrendingBikes] = useState<TrendingBike[]>([]);
  const [loadingTrendingBikes, setLoadingTrendingBikes] = useState(true);
  const [trendingBikesError, setTrendingBikesError] = useState<string | null>(null);

  // Fetch best mileage bikes from API
  useEffect(() => {
    const fetchBestMileageBikes = async () => {
      try {
        setLoadingBikes(true);
        setBikeError(null);
        
        const response = await fetch('/api/bikes/category?category=mileage');
        const data = await response.json();
        
        if (data.success && data.data.bikes) {
          // Take only the first 3 bikes for display
          const topBikes = data.data.bikes.slice(0, 3);
          setBestMileageBikes(topBikes);
        } else {
          setBikeError('Failed to load best mileage bikes');
        }
      } catch (error) {
        console.error('Error fetching best mileage bikes:', error);
        setBikeError('Failed to load best mileage bikes');
      } finally {
        setLoadingBikes(false);
      }
    };

    fetchBestMileageBikes();
  }, []);

  // Fetch trending bikes from different spotlight categories
  useEffect(() => {
    const fetchTrendingBikes = async () => {
      try {
        setLoadingTrendingBikes(true);
        setTrendingBikesError(null);
        
        // Categories to fetch from (same as spotlight)
        const categories = ['commuter', 'sports', 'cruiser', 'electric'];
        const allTrendingBikes: TrendingBike[] = [];
        
        // Fetch bikes from each category
        for (const category of categories) {
          try {
            const response = await fetch(`/api/bikes/category?category=${category}`);
            const data = await response.json();
            
            if (data.success && data.data.bikes) {
              // Take 1-2 bikes from each category
              const categoryBikes = data.data.bikes.slice(0, 1).map((bike: any) => ({
                ...bike,
                category: category
              }));
              allTrendingBikes.push(...categoryBikes);
            }
          } catch (error) {
            console.error(`Error fetching ${category} bikes:`, error);
          }
        }
        
        // Shuffle and take first 5 bikes for variety
        const shuffledBikes = allTrendingBikes.sort(() => Math.random() - 0.5).slice(0, 5);
        setTrendingBikes(shuffledBikes);
        
      } catch (error) {
        console.error('Error fetching trending bikes:', error);
        setTrendingBikesError('Failed to load trending bikes');
      } finally {
        setLoadingTrendingBikes(false);
      }
    };

    fetchTrendingBikes();
  }, []);

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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Best Mileage Bikes</h2>
                    <Link 
                      href="/bikes/mileage/above-60" 
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      View All Mileage Bikes
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loadingBikes ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                          <div className="h-40 bg-gray-200"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-1 w-2/3"></div>
                            <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : bikeError ? (
                      <div className="col-span-3 text-center text-red-600 py-8">
                        {bikeError}
                      </div>
                    ) : (
                      bestMileageBikes.map((bike) => (
                        <div key={bike.variant_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-40 bg-gray-100 flex items-center justify-center">
                            {bike.image_url && bike.image_url !== '/demo.avif' ? (
                              <Image 
                                src={bike.image_url} 
                                alt={bike.variant_name}
                                width={200}
                                height={120}
                                className="object-contain w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<span class="text-gray-500 text-sm">Bike Image</span>';
                                }}
                              />
                            ) : (
                              <span className="text-gray-500">Bike Image</span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1 text-sm">{bike.variant_name}</h3>
                            <p className="text-red-600 font-medium text-sm mb-1">
                              ₹{bike.on_road_price?.toLocaleString('en-IN') || 'N/A'}
                            </p>
                            <p className="text-green-600 font-medium text-sm mb-3">
                              {bike.city_mileage || 'N/A'}
                            </p>
                            <Link 
                              href={`/bikes/${bike.variant_url || bike.variant_name.toLowerCase().replace(/\s+/g, '-')}`}
                              className="w-full block text-center bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Two Wheeler Latest News */}
                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                  <h2 className="text-2xl font-bold mb-6">Two Wheeler Latest News</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {twoWheelerNews.map((news, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                          <Image 
                            src={news.image} 
                            alt={news.title}
                            width={300}
                            height={128}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<span class="text-gray-500 text-sm">News Image</span>';
                            }}
                          />
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
                    {loadingTrendingBikes ? (
                      // Loading skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg animate-pulse">
                          <div className="w-12 h-12 bg-gray-200 rounded-md mr-3"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-1 w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded mb-1 w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))
                    ) : trendingBikesError ? (
                      <div className="text-center text-red-600 py-4 text-sm">
                        {trendingBikesError}
                      </div>
                    ) : (
                      trendingBikes.map((bike) => (
                        <Link 
                          key={bike.variant_id} 
                          href={`/bikes/${bike.variant_url || bike.variant_name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3 overflow-hidden">
                            {bike.image_url && bike.image_url !== '/demo.avif' ? (
                              <Image 
                                src={bike.image_url} 
                                alt={bike.variant_name}
                                width={48}
                                height={48}
                                className="object-contain w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<span class="text-xs text-gray-500">IMG</span>';
                                }}
                              />
                            ) : (
                              <span className="text-xs text-gray-500">IMG</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{bike.variant_name}</h4>
                            <p className="text-xs text-red-600">₹{bike.on_road_price?.toLocaleString('en-IN') || 'N/A'}</p>
                            <p className="text-xs text-green-600">{bike.city_mileage || 'N/A'}</p>
                          </div>
                        </Link>
                      ))
                    )}
                    <Link href="/bikes/all" className="block w-full text-red-500 text-sm font-medium hover:text-red-600 text-center py-2">
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