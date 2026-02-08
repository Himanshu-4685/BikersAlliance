'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MaintenanceModal from '../../../components/MaintenanceModal';
import { 
  FiPercent, 
  FiCreditCard, 
  FiTrendingDown, 
  FiCalendar,
  FiClock,
  FiStar,
  FiInfo,
  FiArrowRight,
  FiGift
} from 'react-icons/fi';

// Sample finance offers data
const financeOffers = [
  {
    id: 1,
    bank: 'HDFC Bank',
    logo: '/images/banks/hdfc.png',
    type: 'Low Interest Rate',
    interest: '8.5%',
    description: 'Starting from 8.5% per annum',
    features: ['Zero processing fee', 'Quick approval', 'Flexible tenure up to 5 years'],
    eligibility: 'Minimum income ₹25,000/month',
    processing: '24-48 hours',
    rating: 4.8
  },
  {
    id: 2,
    bank: 'Bajaj Finserv',
    logo: '/images/banks/bajaj.png',
    type: 'Zero Down Payment',
    interest: '9.99%',
    description: '100% financing available',
    features: ['No down payment required', 'Instant approval', 'Digital documentation'],
    eligibility: 'Minimum income ₹20,000/month',
    processing: 'Instant approval',
    rating: 4.6
  },
  {
    id: 3,
    bank: 'SBI',
    logo: '/images/banks/sbi.png',
    type: 'Government Employee',
    interest: '7.75%',
    description: 'Special rates for govt employees',
    features: ['Lowest interest rates', 'Extended repayment', 'Special govt scheme'],
    eligibility: 'Government employees only',
    processing: '2-3 working days',
    rating: 4.7
  },
  {
    id: 4,
    bank: 'ICICI Bank',
    logo: '/images/banks/icici.png',
    type: 'Festive Offer',
    interest: '8.99%',
    description: 'Limited time festive offer',
    features: ['Cashback up to ₹10,000', 'Free insurance', 'Extended warranty'],
    eligibility: 'Minimum income ₹30,000/month',
    processing: '24 hours',
    rating: 4.5
  }
];

// Sample discount offers
const discountOffers = [
  {
    id: 1,
    title: 'Festive Season Bonanza',
    discount: '₹15,000',
    type: 'Cashback',
    description: 'Get up to ₹15,000 cashback on select bike models',
    validTill: '2024-12-31',
    brands: ['Hero', 'Honda', 'TVS'],
    terms: ['Valid for new bookings only', 'Cannot be combined with other offers', 'T&C apply'],
    image: '/images/offers/festive-offer.jpg'
  },
  {
    id: 2,
    title: 'Exchange Bonus',
    discount: '₹25,000',
    type: 'Exchange',
    description: 'Extra exchange value for your old bike',
    validTill: '2024-11-30',
    brands: ['Royal Enfield', 'Bajaj', 'Yamaha'],
    terms: ['Valid for bikes older than 3 years', 'Subject to bike condition', 'Verification required'],
    image: '/images/offers/exchange-offer.jpg'
  },
  {
    id: 3,
    title: 'Corporate Discount',
    discount: '₹8,000',
    type: 'Corporate',
    description: 'Special discount for corporate employees',
    validTill: '2024-12-15',
    brands: ['All Brands'],
    terms: ['Valid employee ID required', 'Minimum salary ₹40,000', 'Company tie-up required'],
    image: '/images/offers/corporate-offer.jpg'
  },
  {
    id: 4,
    title: 'First Time Buyer',
    discount: '₹5,000',
    type: 'New Customer',
    description: 'Special offer for first-time bike buyers',
    validTill: '2024-12-25',
    brands: ['Hero', 'Honda', 'TVS', 'Bajaj'],
    terms: ['First bike purchase only', 'Age limit 18-35 years', 'Valid documents required'],
    image: '/images/offers/first-buyer-offer.jpg'
  }
];

export default function FinanceOffersPage() {
  const [activeTab, setActiveTab] = useState<'finance' | 'discount'>('finance');
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState<'apply' | 'claim'>('apply');

  const handleApplyNow = () => {
    setMaintenanceType('apply');
    setShowMaintenance(true);
  };

  const handleClaimOffer = () => {
    setMaintenanceType('claim');
    setShowMaintenance(true);
  };

  const closeMaintenance = () => {
    setShowMaintenance(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Finance Your Dream Bike
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Get the best finance deals and exclusive discounts on your favorite bikes
            </p>
            <div className="flex items-center justify-center space-x-8 text-lg">
              <div className="flex items-center">
                <FiPercent className="mr-2" />
                <span>Low Interest Rates</span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-2" />
                <span>Quick Approval</span>
              </div>
              <div className="flex items-center">
                <FiGift className="mr-2" />
                <span>Exclusive Offers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-lg inline-flex border">
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'finance'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiCreditCard className="inline mr-2" />
              Finance Offers
            </button>
            <button
              onClick={() => setActiveTab('discount')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'discount'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiPercent className="inline mr-2" />
              Discount Offers
            </button>
          </div>
        </div>

        {/* Finance Offers Tab */}
        {activeTab === 'finance' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Best Finance Offers
              </h2>
              <p className="text-gray-600">
                Compare and choose from our partner banks and financial institutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {financeOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <FiCreditCard className="text-primary w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{offer.bank}</h3>
                        <p className="text-sm text-gray-600">{offer.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{offer.interest}</div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiStar className="text-yellow-400 mr-1" />
                        {offer.rating}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{offer.description}</p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {offer.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Eligibility:</span>
                      <p className="font-medium">{offer.eligibility}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Processing:</span>
                      <p className="font-medium">{offer.processing}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleApplyNow}
                    className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center"
                  >
                    Apply Now
                    <FiArrowRight className="ml-2" />
                  </button>
                </div>
              ))}
            </div>

            {/* Finance Calculator CTA */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Calculate Your EMI
              </h3>
              <p className="text-gray-600 mb-6">
                Use our EMI calculator to find the best financing option for your budget
              </p>
              <Link
                href="/finance/emi-calculator"
                className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
              >
                Calculate EMI
              </Link>
            </div>
          </div>
        )}

        {/* Discount Offers Tab */}
        {activeTab === 'discount' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Exclusive Discount Offers
              </h2>
              <p className="text-gray-600">
                Save more with our special discount offers and exchange bonuses
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {discountOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 relative">
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                        {offer.type}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                      <p className="text-lg">{offer.description}</p>
                    </div>
                    <div className="absolute top-4 right-4 text-white text-right">
                      <div className="text-3xl font-bold">{offer.discount}</div>
                      <div className="text-sm opacity-90">Save up to</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="mr-1" />
                        Valid till {new Date(offer.validTill).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {offer.brands.join(', ')}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Terms & Conditions:</h4>
                      <ul className="space-y-1">
                        {offer.terms.map((term, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
                            {term}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={handleClaimOffer}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-md hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center"
                    >
                      Claim Offer
                      <FiArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                What documents are required for bike financing?
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                You'll need identity proof, address proof, income proof, and bank statements for the loan application.
              </p>

              <h4 className="font-semibold text-gray-800 mb-2">
                Can I get a loan without a down payment?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes, some financial institutions offer 100% financing options for eligible customers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                How long does the approval process take?
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Most approvals are processed within 24-48 hours, with some offering instant approval.
              </p>

              <h4 className="font-semibold text-gray-800 mb-2">
                Can I combine multiple offers?
              </h4>
              <p className="text-gray-600 text-sm">
                Most offers cannot be combined, but you can choose the best offer that suits your needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Modal */}
      {showMaintenance && (
        <MaintenanceModal
          onClose={closeMaintenance}
          title={maintenanceType === 'apply' ? 'Finance Application Under Maintenance' : 'Offer Claiming Under Maintenance'}
          message={
            maintenanceType === 'apply' 
              ? "Our finance application system is currently undergoing maintenance to serve you better. Please try again later or contact our support team for assistance."
              : "Our offer claiming system is temporarily unavailable. We're working to restore this service quickly. Please check back soon!"
          }
        />
      )}
    </div>
  );
}