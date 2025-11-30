'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiTag, 
  FiClock, 
  FiMapPin, 
  FiPercent,
  FiGift,
  FiTrendingDown,
  FiArrowRight,
  FiFilter,
  FiSearch,
  FiHeart,
  FiShare2,
  FiInfo
} from 'react-icons/fi';

// Sample bike offers data
const bikeOffers = [
  {
    id: 1,
    title: 'Year End Mega Sale',
    bike: {
      name: 'Hero Splendor Plus',
      brand: 'Hero',
      image: '/images/bikes/hero-splendor-plus.jpg',
      originalPrice: 74856,
      offerPrice: 67000,
      discount: 7856
    },
    offerType: 'Limited Time',
    discountPercent: 10.5,
    validTill: '2024-12-31',
    location: 'Delhi',
    dealerName: 'Hero World',
    features: ['Free Registration', '2 Year Extended Warranty', 'Free Service Kit'],
    description: 'Get amazing discounts on India\'s most trusted commuter bike',
    badge: 'Best Seller',
    savings: 'Save ₹7,856'
  },
  {
    id: 2,
    title: 'Festival Special Offer',
    bike: {
      name: 'Honda Activa 6G',
      brand: 'Honda',
      image: '/images/bikes/honda-activa-6g.jpg',
      originalPrice: 76684,
      offerPrice: 71000,
      discount: 5684
    },
    offerType: 'Festival',
    discountPercent: 7.4,
    validTill: '2024-11-15',
    location: 'Mumbai',
    dealerName: 'Honda Galaxy',
    features: ['Free Helmet', 'Free Insurance', 'Extended Warranty'],
    description: 'Special festive discount on India\'s favorite scooter',
    badge: 'Festival Special',
    savings: 'Save ₹5,684'
  },
  {
    id: 3,
    title: 'Exchange Bonanza',
    bike: {
      name: 'Royal Enfield Classic 350',
      brand: 'Royal Enfield',
      image: '/images/bikes/re-classic-350.jpg',
      originalPrice: 193000,
      offerPrice: 175000,
      discount: 18000
    },
    offerType: 'Exchange',
    discountPercent: 9.3,
    validTill: '2024-12-20',
    location: 'Bangalore',
    dealerName: 'RE Store',
    features: ['Exchange Bonus ₹15,000', 'Zero Down Payment', 'Free Accessories Kit'],
    description: 'Upgrade to the legendary Classic 350 with amazing exchange value',
    badge: 'Exchange Bonus',
    savings: 'Save ₹18,000'
  },
  {
    id: 4,
    title: 'Corporate Discount',
    bike: {
      name: 'TVS Raider 125',
      brand: 'TVS',
      image: '/images/bikes/tvs-raider.jpg',
      originalPrice: 98389,
      offerPrice: 92000,
      discount: 6389
    },
    offerType: 'Corporate',
    discountPercent: 6.5,
    validTill: '2024-12-10',
    location: 'Chennai',
    dealerName: 'TVS Motors',
    features: ['Corporate Discount', 'Easy Financing', 'Free Service Package'],
    description: 'Special corporate rates for company employees',
    badge: 'Corporate Deal',
    savings: 'Save ₹6,389'
  },
  {
    id: 5,
    title: 'First Bike Offer',
    bike: {
      name: 'Bajaj Pulsar NS200',
      brand: 'Bajaj',
      image: '/images/bikes/bajaj-pulsar-ns200.jpg',
      originalPrice: 148000,
      offerPrice: 140000,
      discount: 8000
    },
    offerType: 'First Time',
    discountPercent: 5.4,
    validTill: '2024-11-30',
    location: 'Hyderabad',
    dealerName: 'Bajaj Auto',
    features: ['First Time Buyer Discount', 'Free Riding Gear', 'Training Session'],
    description: 'Special offer for first-time bike buyers',
    badge: 'New Rider',
    savings: 'Save ₹8,000'
  },
  {
    id: 6,
    title: 'Premium Bike Sale',
    bike: {
      name: 'KTM Duke 390',
      brand: 'KTM',
      image: '/images/bikes/ktm-duke-390.jpg',
      originalPrice: 295000,
      offerPrice: 280000,
      discount: 15000
    },
    offerType: 'Premium',
    discountPercent: 5.1,
    validTill: '2024-12-25',
    location: 'Pune',
    dealerName: 'KTM Store',
    features: ['Premium Accessories', 'Free Service for 1 Year', 'Performance Kit'],
    description: 'Unleash the beast with special pricing on Duke 390',
    badge: 'Performance',
    savings: 'Save ₹15,000'
  }
];

const filterOptions = {
  brand: ['All Brands', 'Hero', 'Honda', 'Royal Enfield', 'TVS', 'Bajaj', 'KTM'],
  offerType: ['All Types', 'Limited Time', 'Festival', 'Exchange', 'Corporate', 'First Time', 'Premium'],
  location: ['All Locations', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'],
  priceRange: ['All Prices', 'Under ₹1 Lakh', '₹1-2 Lakh', '₹2-3 Lakh', 'Above ₹3 Lakh']
};

export default function BikeOffersPage() {
  const [offers, setOffers] = useState(bikeOffers);
  const [filters, setFilters] = useState({
    brand: 'All Brands',
    offerType: 'All Types',
    location: 'All Locations',
    priceRange: 'All Prices'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('discount');
  const [favoriteOffers, setFavoriteOffers] = useState<number[]>([]);

  // Filter and search functionality
  useEffect(() => {
    let filteredOffers = bikeOffers;

    // Apply filters
    if (filters.brand !== 'All Brands') {
      filteredOffers = filteredOffers.filter(offer => offer.bike.brand === filters.brand);
    }
    if (filters.offerType !== 'All Types') {
      filteredOffers = filteredOffers.filter(offer => offer.offerType === filters.offerType);
    }
    if (filters.location !== 'All Locations') {
      filteredOffers = filteredOffers.filter(offer => offer.location === filters.location);
    }
    if (filters.priceRange !== 'All Prices') {
      filteredOffers = filteredOffers.filter(offer => {
        const price = offer.bike.offerPrice;
        switch (filters.priceRange) {
          case 'Under ₹1 Lakh': return price < 100000;
          case '₹1-2 Lakh': return price >= 100000 && price < 200000;
          case '₹2-3 Lakh': return price >= 200000 && price < 300000;
          case 'Above ₹3 Lakh': return price >= 300000;
          default: return true;
        }
      });
    }

    // Apply search
    if (searchQuery) {
      filteredOffers = filteredOffers.filter(offer =>
        offer.bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.bike.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'discount':
        filteredOffers.sort((a, b) => b.bike.discount - a.bike.discount);
        break;
      case 'price':
        filteredOffers.sort((a, b) => a.bike.offerPrice - b.bike.offerPrice);
        break;
      case 'name':
        filteredOffers.sort((a, b) => a.bike.name.localeCompare(b.bike.name));
        break;
    }

    setOffers(filteredOffers);
  }, [filters, searchQuery, sortBy]);

  const toggleFavorite = (offerId: number) => {
    setFavoriteOffers(prev =>
      prev.includes(offerId)
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              🔥 Hot Bike Offers & Deals
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover amazing discounts and special offers on your favorite bikes
            </p>
            <div className="flex items-center justify-center space-x-8 text-lg">
              <div className="flex items-center">
                <FiPercent className="mr-2" />
                <span>Up to 15% Off</span>
              </div>
              <div className="flex items-center">
                <FiGift className="mr-2" />
                <span>Free Accessories</span>
              </div>
              <div className="flex items-center">
                <FiTag className="mr-2" />
                <span>Exchange Bonus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bikes, brands, offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key}>
                <select
                  value={filters[key as keyof typeof filters]}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="discount">Highest Discount</option>
                <option value="price">Price: Low to High</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {offers.length} offer{offers.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              {/* Badge */}
              <div className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {offer.badge}
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => toggleFavorite(offer.id)}
                    className={`p-2 rounded-full ${
                      favoriteOffers.includes(offer.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:text-red-500'
                    } transition-colors`}
                  >
                    <FiHeart className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Bike Image */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <Image
                    src={offer.bike.image || '/demo.avif'}
                    alt={offer.bike.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <div className="p-6">
                {/* Offer Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{offer.title}</h3>
                
                {/* Bike Details */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700">{offer.bike.name}</h4>
                  <p className="text-sm text-gray-600">{offer.bike.brand}</p>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(offer.bike.offerPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(offer.bike.originalPrice)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold text-lg">
                        {offer.discountPercent}% OFF
                      </div>
                      <div className="text-sm text-gray-600">{offer.savings}</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2 text-sm">Offer Includes:</h5>
                  <div className="space-y-1">
                    {offer.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                    {offer.features.length > 2 && (
                      <div className="text-sm text-primary font-medium">
                        +{offer.features.length - 2} more benefits
                      </div>
                    )}
                  </div>
                </div>

                {/* Location and Validity */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-1 w-4 h-4" />
                    {offer.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-1 w-4 h-4" />
                    {new Date(offer.validTill).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-md hover:from-red-600 hover:to-orange-600 transition-all font-semibold flex items-center justify-center">
                    Get This Offer
                    <FiArrowRight className="ml-2" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/bikes/${offer.bike.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-center border border-primary text-primary py-2 rounded-md hover:bg-primary-50 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    <button className="flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 text-sm">
                      <FiShare2 className="mr-1 w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Dealer Info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dealer:</span>
                    <span className="font-medium">{offer.dealerName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {offers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No Offers Found
            </h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your filters or search terms to find more offers
            </p>
            <button
              onClick={() => {
                setFilters({
                  brand: 'All Brands',
                  offerType: 'All Types',
                  location: 'All Locations',
                  priceRange: 'All Prices'
                });
                setSearchQuery('');
              }}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Don't Miss Out on These Amazing Deals!
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Limited time offers - Book your favorite bike today and save big
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/finance/offers"
              className="bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-semibold"
            >
              View Finance Offers
            </Link>
            <Link
              href="/compare"
              className="border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-blue-600 transition-colors font-semibold"
            >
              Compare Bikes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}