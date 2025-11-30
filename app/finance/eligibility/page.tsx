'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiInfo, 
  FiArrowRight,
  FiUser,
  FiCreditCard,
  FiDollarSign,
  FiFileText
} from 'react-icons/fi';

// Eligibility criteria data
const eligibilityCriteria = [
  {
    category: 'Age Requirements',
    icon: FiUser,
    requirements: [
      'Minimum age: 21 years',
      'Maximum age: 60 years at loan maturity',
      'Valid age proof documents required'
    ]
  },
  {
    category: 'Income Requirements',
    icon: FiDollarSign,
    requirements: [
      'Salaried: Minimum ₹20,000/month',
      'Self-employed: Minimum ₹25,000/month',
      'ITR for last 2 years (self-employed)'
    ]
  },
  {
    category: 'Credit Score',
    icon: FiCreditCard,
    requirements: [
      'CIBIL score of 750 or above preferred',
      'Good credit history required',
      'No defaults in last 2 years'
    ]
  },
  {
    category: 'Documents Required',
    icon: FiFileText,
    requirements: [
      'Identity proof (Aadhaar/PAN/Passport)',
      'Address proof (Utility bills/Aadhaar)',
      'Income proof (Salary slips/ITR)',
      'Bank statements (3-6 months)'
    ]
  }
];

// Loan options based on profile
const loanProfiles = [
  {
    type: 'Salaried Employee',
    maxAmount: '₹5,00,000',
    interestRate: '8.5%',
    tenure: 'Up to 5 years',
    processing: '24-48 hours',
    benefits: ['No guarantor required', 'Quick approval', 'Flexible repayment']
  },
  {
    type: 'Self Employed',
    maxAmount: '₹3,00,000',
    interestRate: '9.5%',
    tenure: 'Up to 5 years',
    processing: '2-3 days',
    benefits: ['Business income considered', 'Seasonal payment options', 'Tax benefits']
  },
  {
    type: 'Government Employee',
    maxAmount: '₹7,50,000',
    interestRate: '8.25%',
    tenure: 'Up to 7 years',
    processing: '24 hours',
    benefits: ['Special government rates', 'Higher loan amounts', 'Pension deduction facility']
  }
];

export default function EligibilityPage() {
  const [selectedProfile, setSelectedProfile] = useState('Salaried Employee');
  const [formData, setFormData] = useState({
    income: '',
    age: '',
    employment: 'salaried',
    cibilScore: '',
    loanAmount: ''
  });

  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null);

  const checkEligibility = () => {
    const income = parseInt(formData.income);
    const age = parseInt(formData.age);
    const cibil = parseInt(formData.cibilScore);
    const loanAmount = parseInt(formData.loanAmount);

    let eligible = true;
    let reasons = [];

    if (age < 21 || age > 60) {
      eligible = false;
      reasons.push('Age should be between 21-60 years');
    }

    if (formData.employment === 'salaried' && income < 20000) {
      eligible = false;
      reasons.push('Minimum income requirement: ₹20,000/month for salaried');
    }

    if (formData.employment === 'self-employed' && income < 25000) {
      eligible = false;
      reasons.push('Minimum income requirement: ₹25,000/month for self-employed');
    }

    if (cibil < 650) {
      eligible = false;
      reasons.push('CIBIL score should be 650 or above');
    }

    if (loanAmount > 500000) {
      eligible = false;
      reasons.push('Maximum loan amount exceeded for your profile');
    }

    if (eligible) {
      setEligibilityResult('eligible');
    } else {
      setEligibilityResult('not-eligible');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bike Loan Eligibility Check
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check if you qualify for a bike loan instantly. Get pre-approved and know your loan amount in minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Eligibility Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Quick Eligibility Check
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={formData.income}
                      onChange={(e) => setFormData({...formData, income: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="28"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={formData.employment}
                    onChange={(e) => setFormData({...formData, employment: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self Employed</option>
                    <option value="government">Government Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIBIL Score (if known)
                  </label>
                  <input
                    type="number"
                    value={formData.cibilScore}
                    onChange={(e) => setFormData({...formData, cibilScore: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="750"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="150000"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={checkEligibility}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Check Eligibility
              </button>

              {/* Eligibility Result */}
              {eligibilityResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  eligibilityResult === 'eligible' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {eligibilityResult === 'eligible' ? (
                      <FiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <FiXCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-semibold ${
                      eligibilityResult === 'eligible' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {eligibilityResult === 'eligible' 
                        ? 'Congratulations! You are eligible for a bike loan.' 
                        : 'Sorry, you do not meet the current eligibility criteria.'
                      }
                    </span>
                  </div>
                  
                  {eligibilityResult === 'eligible' && (
                    <div className="mt-4">
                      <Link 
                        href="/finance/offers"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center"
                      >
                        View Loan Offers
                        <FiArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Loan Profiles Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Loan Options by Profile
              </h3>
              
              <div className="space-y-4">
                {loanProfiles.map((profile) => (
                  <div 
                    key={profile.type}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedProfile === profile.type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProfile(profile.type)}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {profile.type}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Max Amount: <span className="font-medium text-gray-900">{profile.maxAmount}</span></div>
                      <div>Interest: <span className="font-medium text-green-600">{profile.interestRate}</span></div>
                      <div>Tenure: <span className="font-medium">{profile.tenure}</span></div>
                      <div>Processing: <span className="font-medium">{profile.processing}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Link 
                  href="/finance/emi-calculator"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FiArrowRight className="mr-2 w-4 h-4" />
                  Calculate EMI
                </Link>
                
                <Link 
                  href="/finance/offers"
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FiArrowRight className="mr-2 w-4 h-4" />
                  View Offers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Loan Eligibility Criteria
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eligibilityCriteria.map((criteria, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <criteria.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {criteria.category}
                </h3>
                <ul className="space-y-2">
                  {criteria.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="flex items-start text-sm text-gray-600">
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Tips to Improve Loan Eligibility
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Maintain Good Credit Score</h3>
                <p className="text-sm text-gray-600">Keep your CIBIL score above 750 for better approval chances and lower interest rates.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Stable Employment</h3>
                <p className="text-sm text-gray-600">Have a stable job for at least 6 months to show consistent income.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lower Debt-to-Income Ratio</h3>
                <p className="text-sm text-gray-600">Keep your existing EMIs under 50% of your monthly income.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Complete Documentation</h3>
                <p className="text-sm text-gray-600">Have all required documents ready to speed up the approval process.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Choose Right Loan Amount</h3>
                <p className="text-sm text-gray-600">Apply for a loan amount that fits comfortably within your budget.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Consider Co-applicant</h3>
                <p className="text-sm text-gray-600">Adding a co-applicant with good credit can improve approval chances.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}