'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiInfo, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

// Popular bikes data for the side section
const popularBikes = [
  {
    id: 1,
    name: 'Royal Enfield Hunter 350',
    price: '₹1.50 Lakh',
    image: '/images/bikes/hunter-350.jpg'
  },
  {
    id: 2,
    name: 'Hero Splendor Plus',
    price: '₹74,856',
    image: '/images/bikes/splendor-plus.jpg'
  },
  {
    id: 3,
    name: 'TVS Raider',
    price: '₹98,389',
    image: '/images/bikes/tvs-raider.jpg'
  },
  {
    id: 4,
    name: 'Honda Activa 6G',
    price: '₹76,684',
    image: '/images/bikes/activa-6g.jpg'
  },
  {
    id: 5,
    name: 'Royal Enfield Classic 350',
    price: '₹1.93 Lakh',
    image: '/images/bikes/classic-350.jpg'
  }
];

const topBikes = [
  {
    name: 'Royal Enfield Hunter 350',
    price: '₹1.50 Lakh onwards',
    image: '/images/bikes/hunter-350.jpg'
  },
  {
    name: 'Royal Enfield Continental GT 650',
    price: '₹3.19 Lakh onwards',
    image: '/images/bikes/continental-gt-650.jpg'
  },
  {
    name: 'Royal Enfield Classic 350',
    price: '₹1.93 Lakh onwards',
    image: '/images/bikes/classic-350.jpg'
  }
];

const upcomingBikes = [
  {
    name: 'Bajaj Pulsar NS400',
    price: '₹2.30 Lakh*',
    date: '2025 Launch',
    image: '/images/bikes/pulsar-ns400.jpg'
  },
  {
    name: 'Hero Xpulse 300',
    price: '₹2.50 Lakh*',
    date: '2025 Launch',
    image: '/images/bikes/xpulse-300.jpg'
  },
  {
    name: 'TVS Apache RR 310',
    price: '₹2.75 Lakh*',
    date: '2025 Launch',
    image: '/images/bikes/apache-rr-310.jpg'
  },
  {
    name: 'KTM RC 200',
    price: '₹2.20 Lakh*',
    date: '2025 Launch',
    image: '/images/bikes/ktm-rc-200.jpg'
  },
  {
    name: 'Yamaha R15 V5',
    price: '₹1.80 Lakh*',
    date: '2025 Launch',
    image: '/images/bikes/yamaha-r15-v5.jpg'
  }
];

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(150000);
  const [downPayment, setDownPayment] = useState(30000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [loanTenure, setLoanTenure] = useState(36);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

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
                    <FiDollarSign className="w-6 h-6 mr-3 text-red-500" />
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
                        <h3 className="text-lg font-semibold text-red-800 mb-4">Monthly EMI</h3>
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
                  <h2 className="text-2xl font-bold mb-6">Top 10 Bikes in India</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topBikes.map((bike, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Bike Image</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{bike.name}</h3>
                          <p className="text-red-600 font-medium">{bike.price}</p>
                          <button className="w-full mt-3 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm">
                            View September Offers
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Popular Two Wheelers */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Popular Two-Wheelers</h3>
                  <div className="space-y-4">
                    {popularBikes.map((bike) => (
                      <div key={bike.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">{bike.name}</h4>
                          <p className="text-xs text-red-600">{bike.price}</p>
                        </div>
                      </div>
                    ))}
                    <button className="w-full text-red-500 text-sm font-medium hover:text-red-600">
                      View All Popular Bikes
                    </button>
                  </div>
                </div>

                {/* Upcoming Bikes and Scooters */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Bikes and Scooters</h3>
                  <div className="space-y-4">
                    {upcomingBikes.map((bike, index) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">{bike.name}</h4>
                          <p className="text-xs text-red-600">{bike.price}</p>
                          <p className="text-xs text-gray-500">{bike.date}</p>
                        </div>
                      </div>
                    ))}
                    <button className="w-full text-red-500 text-sm font-medium hover:text-red-600">
                      View All Upcoming Bikes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Two Wheelers by Price */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Search Two Wheelers by Price</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Under ₹50,000',
                '₹50,000 - ₹1 Lakh', 
                '₹1 Lakh - ₹1.5 Lakh',
                'Above ₹1.5 Lakh'
              ].map((range, index) => (
                <button key={index} className="p-4 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center">
                  <span className="font-medium text-gray-900">{range}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Bike Families */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Popular Bike Families</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Royal Enfield 350', image: '/images/families/re-350.jpg' },
                { name: 'Honda Activa', image: '/images/families/activa.jpg' },
                { name: 'Royal Enfield Classic', image: '/images/families/re-classic.jpg' }
              ].map((family, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Family Image</span>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900">{family.name}</h3>
                  </div>
                </div>
              ))}
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