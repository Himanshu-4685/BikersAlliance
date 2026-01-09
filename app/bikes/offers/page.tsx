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
  FiInfo,
  FiX,
  FiUser,
  FiMail,
  FiPhone
} from 'react-icons/fi';

const filterOptions = {
  brand: ['All Brands', 'Hero', 'Honda', 'Royal Enfield', 'TVS', 'Bajaj', 'KTM'],
  offerType: ['All Types', 'Limited Time', 'Festival', 'Exchange', 'Corporate', 'First Time', 'Premium'],
  location: ['All Locations', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'],
  priceRange: ['All Prices', 'Under ₹1 Lakh', '₹1-2 Lakh', '₹2-3 Lakh', 'Above ₹3 Lakh']
};

export default function BikeOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brand: 'All Brands',
    offerType: 'All Types',
    location: 'All Locations',
    priceRange: 'All Prices'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('discount');
  const [favoriteOffers, setFavoriteOffers] = useState<number[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerFormData, setOfferFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (filters.brand !== 'All Brands') {
          params.append('brand', filters.brand);
        }
        if (filters.offerType !== 'All Types') {
          params.append('offerType', filters.offerType);
        }
        if (filters.location !== 'All Locations') {
          params.append('location', filters.location);
        }

        const response = await fetch(`/api/offers?${params.toString()}`);
        const result = await response.json();

        console.log('API Response:', result); // Debug logging

        if (result.success) {
          let fetchedOffers = result.data || [];
          console.log('Fetched offers:', fetchedOffers); // Debug logging
          console.log('Sample offer image_url:', fetchedOffers[0]?.image_url); // Debug image URLs
          
          // Apply client-side filtering for price range and search
          if (filters.priceRange !== 'All Prices') {
            fetchedOffers = fetchedOffers.filter((offer: any) => {
              const price = offer.offer_price;
              switch (filters.priceRange) {
                case 'Under ₹1 Lakh': return price < 100000;
                case '₹1-2 Lakh': return price >= 100000 && price < 200000;
                case '₹2-3 Lakh': return price >= 200000 && price < 300000;
                case 'Above ₹3 Lakh': return price >= 300000;
                default: return true;
              }
            });
          }

          if (searchQuery) {
            fetchedOffers = fetchedOffers.filter((offer: any) =>
              offer.bike_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              offer.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              offer.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          // Apply client-side sorting
          fetchedOffers.sort((a: any, b: any) => {
            switch (sortBy) {
              case 'discount':
                return b.discount_percent - a.discount_percent;
              case 'price':
                return a.offer_price - b.offer_price;
              case 'name':
                return a.bike_name?.localeCompare(b.bike_name) || 0;
              default:
                return b.discount_percent - a.discount_percent;
            }
          });

          setOffers(fetchedOffers);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch offers');
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
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

  const handleGetOffer = (offer: any) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
  };

  const handleCloseModal = () => {
    setShowOfferModal(false);
    setSelectedOffer(null);
    setOfferFormData({
      name: '',
      email: '',
      mobile: ''
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/offer-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...offerFormData,
          offerId: selectedOffer?.id,
          bikeName: selectedOffer?.bike_name,
          dealerName: selectedOffer?.dealer_name,
          offerTitle: selectedOffer?.title,
          offerPrice: selectedOffer?.offer_price,
          originalPrice: selectedOffer?.original_price,
          discountPercent: selectedOffer?.discount_percent
        }),
      });

      if (response.ok) {
        alert('Your offer request has been submitted successfully! We will contact you soon.');
        handleCloseModal();
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Error Loading Offers
            </h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: any) => (
            <div key={offer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              {/* Badge */}
              <div className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {offer.offer_type || 'Special Offer'}
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
                    src={offer.image_url || '/demo.avif'}
                    alt={offer.bike_name}
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
                  <h4 className="text-lg font-semibold text-gray-700">{offer.bike_name}</h4>
                  <p className="text-sm text-gray-600">{offer.brand_name}</p>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(offer.offer_price)}
                      </span>
                      {offer.original_price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(offer.original_price)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold text-lg">
                        {offer.discount_percent}% OFF
                      </div>
                      <div className="text-sm text-gray-600">
                        Save ₹{(offer.original_price - offer.offer_price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2 text-sm">Offer Includes:</h5>
                  <div className="space-y-1">
                    {offer.features && offer.features.slice(0, 2).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                    {offer.features && offer.features.length > 2 && (
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
                    {new Date(offer.valid_till).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button 
                    onClick={() => handleGetOffer(offer)}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-md hover:from-red-600 hover:to-orange-600 transition-all font-semibold flex items-center justify-center"
                  >
                    Get This Offer
                    <FiArrowRight className="ml-2" />
                  </button>
                </div>

                {/* Dealer Info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dealer:</span>
                    <span className="font-medium">{offer.dealer_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

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

        {/* Offer Request Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Request Offer Details
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Selected Offer Info */}
                {selectedOffer && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🏍️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{selectedOffer.bike_name}</h4>
                        <p className="text-sm text-gray-600">{selectedOffer.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Offer Price:</span>
                      <span className="font-bold text-primary">{formatPrice(selectedOffer.offer_price)}</span>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline w-4 h-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={offerFormData.name}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline w-4 h-4 mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={offerFormData.email}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="inline w-4 h-4 mr-1" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={offerFormData.mobile}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your mobile number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>

                  <div className="text-xs text-gray-500">
                    * We'll contact you within 24 hours with the offer details and next steps.
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-md hover:from-red-600 hover:to-orange-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}