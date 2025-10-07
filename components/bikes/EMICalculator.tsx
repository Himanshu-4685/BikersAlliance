'use client';

import { useState, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';

// Types
interface EMICalculatorProps {
  bikePrice: number;
}

export default function EMICalculator({ bikePrice }: EMICalculatorProps) {
  const [downPayment, setDownPayment] = useState<number>(Math.round(bikePrice * 0.2)); // Default 20% down payment
  const [loanAmount, setLoanAmount] = useState<number>(bikePrice - downPayment);
  const [interestRate, setInterestRate] = useState<number>(9.5); // Default interest rate
  const [tenure, setTenure] = useState<number>(36); // Default 3 years (36 months)
  const [monthlyEMI, setMonthlyEMI] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Calculate EMI whenever inputs change
  useEffect(() => {
    calculateEMI();
  }, [bikePrice, downPayment, interestRate, tenure]);
  
  // Handle down payment change
  const handleDownPaymentChange = (value: number) => {
    const newDownPayment = Math.min(Math.max(0, value), bikePrice);
    setDownPayment(newDownPayment);
    setLoanAmount(bikePrice - newDownPayment);
  };
  
  // Handle loan amount change
  const handleLoanAmountChange = (value: number) => {
    const newLoanAmount = Math.min(Math.max(0, value), bikePrice);
    setLoanAmount(newLoanAmount);
    setDownPayment(bikePrice - newLoanAmount);
  };
  
  // Calculate EMI
  const calculateEMI = () => {
    if (loanAmount <= 0 || tenure <= 0) {
      setMonthlyEMI(0);
      setTotalInterest(0);
      setTotalAmount(downPayment);
      return;
    }
    
    const monthlyInterestRate = interestRate / (12 * 100); // Convert annual rate to monthly and percentage to decimal
    const emi = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure) / 
      (Math.pow(1 + monthlyInterestRate, tenure) - 1);
    
    const calculatedEMI = Math.round(emi);
    const totalPayment = calculatedEMI * tenure;
    const calculatedInterest = totalPayment - loanAmount;
    
    setMonthlyEMI(calculatedEMI);
    setTotalInterest(calculatedInterest);
    setTotalAmount(downPayment + totalPayment);
  };
  
  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">EMI Calculator</h2>
      <p className="mt-1 text-xs text-gray-500">
        Calculate your monthly installment based on loan amount and tenure
      </p>
      
      {/* Bike Price */}
      <div className="mt-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Bike Price</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
          <input
            type="text"
            className="w-full py-2 pl-8 pr-3 bg-gray-100 border-gray-300 rounded-md"
            value={bikePrice.toLocaleString('en-IN')}
            disabled
          />
        </div>
      </div>
      
      {/* Down Payment */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Down Payment</label>
          <span className="text-xs text-gray-500">
            {Math.round((downPayment / bikePrice) * 100)}%
          </span>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
          <input
            type="number"
            className="w-full py-2 pl-8 pr-3 border border-gray-300 rounded-md"
            value={downPayment}
            onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
          />
        </div>
        <input
          type="range"
          min={0}
          max={bikePrice}
          step={5000}
          value={downPayment}
          onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
          className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {/* Loan Amount */}
      <div className="mt-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Loan Amount</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
          <input
            type="number"
            className="w-full py-2 pl-8 pr-3 border border-gray-300 rounded-md"
            value={loanAmount}
            onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
          />
        </div>
      </div>
      
      {/* Interest Rate */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Interest Rate</label>
          <span className="text-xs text-gray-500">{interestRate}% per annum</span>
        </div>
        <input
          type="range"
          min={5}
          max={20}
          step={0.5}
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {/* Loan Tenure */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Loan Tenure</label>
          <span className="text-xs text-gray-500">
            {Math.floor(tenure / 12)} years {tenure % 12} months
          </span>
        </div>
        <div className="flex space-x-2">
          {[12, 24, 36, 48, 60].map((months) => (
            <button
              key={months}
              onClick={() => setTenure(months)}
              className={`flex-1 py-1 text-sm border rounded-md ${
                tenure === months 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {months / 12} {months === 12 ? 'yr' : 'yrs'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results */}
      <div className="p-4 mt-6 border rounded-md bg-gray-50">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Monthly EMI</p>
            <p className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
              ₹ {monthlyEMI.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              ₹ {totalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500">
              (Down payment + Total EMIs)
            </p>
          </div>
        </div>
        
        <div className="flex justify-between mt-3">
          <div>
            <p className="text-sm text-gray-500">Principal</p>
            <p className="font-medium">
              ₹ {bikePrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Interest</p>
            <p className="font-medium">
              ₹ {totalInterest.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-start mt-3 text-xs text-gray-500">
        <FiInfo className="flex-shrink-0 mr-1 text-gray-400" style={{ marginTop: '2px' }} />
        <p>
          This is only an estimate. Actual EMI and interest rates may vary based on your credit score, 
          bank policies, and other factors. Processing fees and other charges may apply.
        </p>
      </div>
    </div>
  );
}