'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiDollarSign, 
  FiPercent, 
  FiCreditCard, 
  FiTrendingUp,
  FiGift,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiShield,
  FiPhoneCall
} from 'react-icons/fi';

// Import calculator icon from a different set or use an alternative
import { HiCalculator } from 'react-icons/hi';

// Finance options data
const financeOptions = [
  {
    id: 1,
    title: 'Low Interest Rates',
    description: 'Starting from 8.5% per annum',
    icon: FiPercent,
    color: 'bg-green-500',
    href: '/finance/offers'
  },
  {
    id: 2,
    title: 'Zero Down Payment',
    description: '100% financing available',
    icon: FiDollarSign,
    color: 'bg-blue-500',
    href: '/finance/offers'
  },
  {
    id: 3,
    title: 'EMI Calculator',
    description: 'Calculate your monthly EMI',
    icon: HiCalculator,
    color: 'bg-purple-500',
    href: '/finance/emi-calculator'
  },
  {
    id: 4,
    title: 'Quick Approval',
    description: 'Get approval in 24-48 hours',
    icon: FiClock,
    color: 'bg-orange-500',
    href: '/finance/offers'
  }
];

// Featured finance partners
const financePartners = [
  {
    name: 'HDFC Bank',
    logo: '/images/banks/hdfc.png',
    interest: '8.5%',
    features: ['Zero processing fee', 'Quick approval']
  },
  {
    name: 'Bajaj Finserv',
    logo: '/images/banks/bajaj.png',
    interest: '9.99%',
    features: ['Zero down payment', 'Instant approval']
  },
  {
    name: 'SBI',
    logo: '/images/banks/sbi.png',
    interest: '9.25%',
    features: ['Government rates', 'Flexible tenure']
  },
  {
    name: 'ICICI Bank',
    logo: '/images/banks/icici.png',
    interest: '8.75%',
    features: ['Digital process', 'Quick disbursal']
  }
];

// Benefits data
const benefits = [
  {
    icon: FiShield,
    title: 'Secure Process',
    description: 'Bank-grade security for all transactions'
  },
  {
    icon: FiClock,
    title: 'Quick Approval',
    description: 'Get loan approval in just 24-48 hours'
  },
  {
    icon: FiPercent,
    title: 'Best Rates',
    description: 'Competitive interest rates starting from 8.5%'
  },
  {
    icon: FiUsers,
    title: 'Expert Support',
    description: '24/7 customer support for all queries'
  }
];

// Featured bikes for finance
const featuredBikes = [
  {
    id: 1,
    name: 'Royal Enfield Hunter 350',
    price: '₹1,50,000',
    emi: '₹3,200/month',
    image: '/images/bikes/hunter-350.jpg',
    href: '/bikes/royal-enfield-hunter-350'
  },
  {
    id: 2,
    name: 'TVS Raider',
    price: '₹98,389',
    emi: '₹2,100/month',
    image: '/images/bikes/tvs-raider.jpg',
    href: '/bikes/tvs-raider'
  },
  {
    id: 3,
    name: 'Hero Splendor Plus',
    price: '₹74,856',
    emi: '₹1,600/month',
    image: '/images/bikes/splendor-plus.jpg',
    href: '/bikes/hero-splendor-plus'
  },
  {
    id: 4,
    name: 'Royal Enfield Classic 350',
    price: '₹1,93,000',
    emi: '₹4,100/month',
    image: '/images/bikes/classic-350.jpg',
    href: '/bikes/royal-enfield-classic-350'
  }
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLoanAmount, setSelectedLoanAmount] = useState(150000);
  const [selectedTenure, setSelectedTenure] = useState(36);
  const [interestRate] = useState(9.5);

  // Calculate EMI
  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const emi = calculateEMI(selectedLoanAmount, interestRate, selectedTenure);
  const totalAmount = emi * selectedTenure;
  const totalInterest = totalAmount - selectedLoanAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bike Finance Made Easy
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Get instant loan approval with the lowest interest rates. 
              Finance your dream bike today with our trusted partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/finance/offers"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <FiGift className="mr-2" />
                View Finance Offers
              </Link>
              <Link 
                href="/finance/emi-calculator"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                <HiCalculator className="mr-2" />
                Calculate EMI
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Finance Options Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Finance Option
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore various financing options tailored to your needs. 
              From low interest rates to zero down payments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financeOptions.map((option) => (
              <Link 
                key={option.id}
                href={option.href}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className={`${option.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {option.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  Learn More
                  <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick EMI Calculator */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Quick EMI Calculator
              </h2>
              <p className="text-gray-600">
                Get an instant estimate of your monthly EMI
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Calculator Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={selectedLoanAmount}
                        onChange={(e) => setSelectedLoanAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="150000"
                      />
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="500000"
                      step="10000"
                      value={selectedLoanAmount}
                      onChange={(e) => setSelectedLoanAmount(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₹50K</span>
                      <span>₹5L</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Tenure
                    </label>
                    <select
                      value={selectedTenure}
                      onChange={(e) => setSelectedTenure(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={12}>1 Year</option>
                      <option value={24}>2 Years</option>
                      <option value={36}>3 Years</option>
                      <option value={48}>4 Years</option>
                      <option value={60}>5 Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <span className="text-blue-600 font-semibold">{interestRate}% per annum</span>
                      <p className="text-xs text-blue-600 mt-1">Best available rate</p>
                    </div>
                  </div>
                </div>

                {/* EMI Results */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">EMI Breakdown</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Monthly EMI</span>
                      <span className="text-2xl font-bold text-blue-600">₹{emi.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Principal Amount</span>
                      <span className="font-semibold">₹{selectedLoanAmount.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Total Interest</span>
                      <span className="font-semibold">₹{totalInterest.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Link 
                    href="/finance/emi-calculator"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-6 inline-flex items-center justify-center"
                  >
                    Detailed Calculator
                    <FiArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Finance Partners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Finance Partners
            </h2>
            <p className="text-gray-600">
              Trusted by millions of customers across India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financePartners.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">{partner.name}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {partner.name}
                </h3>
                <div className="text-2xl font-bold text-blue-600 mb-3">
                  {partner.interest}
                </div>
                <div className="space-y-1">
                  {partner.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center text-sm text-gray-600">
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/finance/offers"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              View All Offers
              <FiArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BikersAlliance Finance?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience hassle-free bike financing with our comprehensive services and expert support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bikes for Finance */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Bikes for Finance
            </h2>
            <p className="text-gray-600">
              Get easy financing for these popular bike models
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBikes.map((bike) => (
              <Link 
                key={bike.id}
                href={bike.href}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="aspect-w-16 aspect-h-10 bg-gray-100">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Bike Image</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {bike.name}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">{bike.price}</span>
                    <span className="text-sm text-gray-600">Ex-showroom</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">EMI starts from</span>
                      <span className="font-semibold text-blue-600">{bike.emi}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Finance Your Dream Bike?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get instant pre-approval and ride home your favorite bike today. 
              Our finance experts are here to help you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/finance/offers"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <FiCreditCard className="mr-2" />
                Apply for Loan
              </Link>
              <a 
                href="tel:+91-9876543210"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                <FiPhoneCall className="mr-2" />
                Call Now: +91-9876543210
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}