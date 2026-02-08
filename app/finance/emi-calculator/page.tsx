'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiInfo, FiTrendingUp } from 'react-icons/fi';

// Types
interface BikeData {
  id: string;
  name: string;
  price: string;
  slug?: string;
  image?: string;
  brand?: string;
  expectedLaunch?: string;
}

interface PopularBike {
  id: number;
  name: string;
  price: string;
  image?: string;
}

export default function EMICalculatorPage() {
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const urlBikePrice = searchParams.get('price');
  const urlEmi = searchParams.get('emi');
  const urlTenure = searchParams.get('tenure');
  
  const [loanAmount, setLoanAmount] = useState(() => {
    return urlBikePrice ? parseInt(urlBikePrice) : 150000;
  });
  const [downPayment, setDownPayment] = useState(() => {
    const price = urlBikePrice ? parseInt(urlBikePrice) : 150000;
    return Math.round(price * 0.2); // Default 20% down payment
  });
  const [interestRate, setInterestRate] = useState(10.5);
  const [loanTenure, setLoanTenure] = useState(() => {
    return urlTenure ? parseInt(urlTenure) : 36;
  });
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Real data states
  const [popularBikes, setPopularBikes] = useState<PopularBike[]>([]);
  const [topBikes, setTopBikes] = useState<BikeData[]>([]);
  const [upcomingBikes, setUpcomingBikes] = useState<BikeData[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateEMI = () => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const months = loanTenure;

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      setEmi(0);
      setTotalInterest(0);
      setTotalAmount(0);
      return;
    }

    const emiAmount = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                     (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalAmountPayable = emiAmount * months;
    const totalInterestPayable = totalAmountPayable - principal;

    setEmi(Math.round(emiAmount));
    setTotalInterest(Math.round(totalInterestPayable));
    setTotalAmount(Math.round(totalAmountPayable));
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, downPayment, interestRate, loanTenure]);

  // Fetch real bike data
  useEffect(() => {
    const fetchBikeData = async () => {
      try {
        setLoading(true);
        
        // Fetch popular bikes (commuter category - affordable bikes)
        const popularResponse = await fetch('/api/bikes/category?category=commuter');
        const popularData = await popularResponse.json();
        
        if (popularData.success && popularData.data?.bikes) {
          const formattedPopular = popularData.data.bikes.slice(0, 5).map((bike: any) => ({
            id: bike.variant_id || bike.id,
            name: bike.variant_name || bike.name,
            price: bike.on_road_price ? `₹${(bike.on_road_price / 100000).toFixed(2)} Lakh` : 'Price on request',
            image: bike.image_url || '/demo.avif'
          }));
          setPopularBikes(formattedPopular);
        }
        
        // Fetch top bikes (sports/premium category)
        const topResponse = await fetch('/api/bikes/category?category=sports');
        const topData = await topResponse.json();
        
        if (topData.success && topData.data?.bikes) {
          const formattedTop = topData.data.bikes.slice(0, 3).map((bike: any) => ({
            id: bike.variant_id || bike.id,
            name: bike.variant_name || bike.name,
            price: bike.on_road_price ? `₹${(bike.on_road_price / 100000).toFixed(2)} Lakh onwards` : 'Price on request',
            slug: bike.url,
            image: bike.image_url || '/demo.avif'
          }));
          setTopBikes(formattedTop);
        }
        
        // Fetch upcoming bikes
        const upcomingResponse = await fetch('/api/bike-status?status=upcoming&limit=5');
        const upcomingData = await upcomingResponse.json();
        
        if (upcomingData.success && upcomingData.data) {
          const formattedUpcoming = upcomingData.data.slice(0, 5).map((bike: any) => ({
            id: bike.variant?.id || bike.id,
            name: bike.variant?.name || bike.model?.name || 'Unknown Bike',
            price: bike.priceRange || 'Price TBA',
            slug: bike.variant?.slug || `bike-${bike.variant?.id || bike.id}`,
            image: bike.variant?.images?.[0]?.url || '/demo.avif',
            brand: bike.brand?.name || 'Unknown',
            expectedLaunch: bike.expectedLaunch
          }));
          setUpcomingBikes(formattedUpcoming);
        }
        
      } catch (error) {
        console.error('Error fetching bike data:', error);
        // Fallback to some default data if API fails
        setPopularBikes([
          { id: 1, name: 'Hero Splendor Plus', price: '₹0.75 Lakh' },
          { id: 2, name: 'Honda Activa 6G', price: '₹0.77 Lakh' },
          { id: 3, name: 'TVS Raider', price: '₹0.98 Lakh' }
        ]);
        setTopBikes([
          { id: '1', name: 'Royal Enfield Hunter 350', price: '₹1.50 Lakh onwards' },
          { id: '2', name: 'KTM Duke 200', price: '₹1.85 Lakh onwards' }
        ]);
        setUpcomingBikes([
          { id: '1', name: 'Bajaj Pulsar NS400', price: '₹2.30 Lakh*', brand: 'Bajaj', expectedLaunch: '2025-03-15' },
          { id: '2', name: 'Hero Xpulse 300', price: '₹2.50 Lakh*', brand: 'Hero', expectedLaunch: '2025-04-20' },
          { id: '3', name: 'TVS Apache RR 310', price: '₹2.75 Lakh*', brand: 'TVS', expectedLaunch: '2025-06-10' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBikeData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bike Loan EMI Calculator
            </h1>
            <p className="text-xl text-red-100 mb-8">
              Calculate the exact EMI for your bike loan. Use our EMI calculator to receive an estimate EMI on the monthly EMI amount.
            </p>
            <div className="bg-white/10 rounded-lg p-6 inline-block">
              <p className="text-lg mb-2">Quick EMI calculation in a couple of clicks. Avail competitive schemes for your bike loan under monthly finances that is the best in the market!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* EMI Calculator */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    Calculate Your Two Wheeler EMI
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Controls */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bike Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="10000"
                            max="10000000"
                          />
                        </div>
                        <input
                          type="range"
                          min="10000"
                          max="1000000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full mt-2 accent-red-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₹10K</span>
                          <span>₹10L</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Down Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            value={downPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="0"
                            max={loanAmount * 0.9}
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={loanAmount * 0.8}
                          value={downPayment}
                          onChange={(e) => setDownPayment(Number(e.target.value))}
                          className="w-full mt-2 accent-red-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₹0</span>
                          <span>₹{Math.round(loanAmount * 0.8 / 1000)}K</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interest Rate (% per annum)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="5"
                            max="25"
                            step="0.1"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="25"
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="w-full mt-2 accent-red-500"
                          step="0.1"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>5%</span>
                          <span>25%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Tenure (Months)
                        </label>
                        <select
                          value={loanTenure}
                          onChange={(e) => setLoanTenure(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value={12}>12 Months</option>
                          <option value={18}>18 Months</option>
                          <option value={24}>24 Months</option>
                          <option value={36}>36 Months</option>
                          <option value={48}>48 Months</option>
                          <option value={60}>60 Months</option>
                        </select>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                      <div className="bg-red-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-800 mb-4">EMI</h3>
                        <div className="text-3xl font-bold text-red-600">
                          {formatCurrency(emi)}
                        </div>
                        <p className="text-sm text-red-700 mt-2">/month</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Principal Amount</h4>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(loanAmount - downPayment)}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Total Interest</h4>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(totalInterest)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Total Amount Payable</h4>
                        <div className="text-xl font-bold text-blue-900">
                          {formatCurrency(totalAmount)}
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <FiInfo className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Note:</p>
                            <p>This is an approximate calculation. Actual EMI may vary based on the lender's terms and conditions.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Chart */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Payment Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(loanAmount - downPayment)}
                        </div>
                        <p className="text-sm text-green-700 font-medium">Principal Amount</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(totalInterest)}
                        </div>
                        <p className="text-sm text-orange-700 font-medium">Total Interest</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(totalAmount)}
                        </div>
                        <p className="text-sm text-blue-700 font-medium">Total Payable</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 10 Bikes in India */}
                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                  <h2 className="text-2xl font-bold mb-6">Top Bikes in India</h2>
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="h-40 bg-gray-200 animate-pulse"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {topBikes.map((bike) => (
                        <div key={bike.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-40 bg-gray-200 flex items-center justify-center relative">
                            {bike.image && bike.image !== '/demo.avif' ? (
                              <Image 
                                src={bike.image} 
                                alt={bike.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-gray-500">Bike Image</span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{bike.name}</h3>
                            <p className="text-red-600 font-medium">{bike.price}</p>
                            <Link 
                              href={`/bikes/${bike.id}`}
                              className="block w-full mt-3 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm text-center"
                            >
                              Check EMI
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Popular Two Wheelers */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Popular Two-Wheelers</h3>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center p-3 border border-gray-200 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse mr-3"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {popularBikes.map((bike) => (
                        <Link 
                          key={bike.id} 
                          href={`/bikes/${bike.id}`}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                            {bike.image && bike.image !== '/demo.avif' ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={bike.image} 
                                  alt={bike.name}
                                  fill
                                  className="object-cover rounded-md"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">IMG</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{bike.name}</h4>
                            <p className="text-xs text-red-600">{bike.price}</p>
                          </div>
                        </Link>
                      ))}
                      <button className="w-full text-red-500 text-sm font-medium hover:text-red-600">
                        <a href="/bikes/all">View All Popular Bikes</a>
                      </button>
                    </div>
                  )}
                </div>

                {/* Upcoming Bikes and Scooters */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Bikes and Scooters</h3>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center p-3 border border-gray-200 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse mr-3"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBikes.map((bike) => (
                        <Link 
                          key={bike.id} 
                          href={`/bikes/${bike.id}`}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                            {bike.image && bike.image !== '/demo.avif' ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={bike.image} 
                                  alt={bike.name}
                                  fill
                                  className="object-cover rounded-md"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">IMG</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{bike.name}</h4>
                            <p className="text-xs text-red-600">{bike.price}</p>
                            {bike.expectedLaunch ? (
                              <p className="text-xs text-gray-500">
                                Launch: {new Date(bike.expectedLaunch).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500">2025 Launch</p>
                            )}
                            {bike.brand && (
                              <p className="text-xs text-blue-600">{bike.brand}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                      <button className="w-full text-red-500 text-sm font-medium hover:text-red-600">
                        <a href="/upcoming-bikes">View All Upcoming Bikes</a>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="font-semibold mb-2">Disclaimer</h3>
            <p className="text-sm text-gray-600">
              The calculations provided are indicative and for estimation purposes only. The actual EMI may vary based on the lender's terms and conditions, 
              processing fees, and other charges. Interest rates are subject to change based on the bank's policies and your credit profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}