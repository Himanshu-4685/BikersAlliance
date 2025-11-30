import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

// Sample finance offers data - in a real app, this would come from a database
const financeOffersData = [
  {
    id: 1,
    bank_name: 'HDFC Bank',
    bank_logo: '/images/banks/hdfc.png',
    offer_type: 'Low Interest Rate',
    interest_rate: 8.5,
    description: 'Starting from 8.5% per annum',
    features: ['Zero processing fee', 'Quick approval', 'Flexible tenure up to 5 years'],
    eligibility: 'Minimum income ₹25,000/month',
    processing_time: '24-48 hours',
    rating: 4.8,
    max_loan_amount: 500000,
    min_loan_amount: 50000,
    max_tenure_months: 60,
    processing_fee: 0,
    location: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai']
  },
  {
    id: 2,
    bank_name: 'Bajaj Finserv',
    bank_logo: '/images/banks/bajaj.png',
    offer_type: 'Zero Down Payment',
    interest_rate: 9.99,
    description: '100% financing available',
    features: ['No down payment required', 'Instant approval', 'Digital documentation'],
    eligibility: 'Minimum income ₹20,000/month',
    processing_time: 'Instant approval',
    rating: 4.6,
    max_loan_amount: 300000,
    min_loan_amount: 30000,
    max_tenure_months: 48,
    processing_fee: 999,
    location: ['All India']
  },
  {
    id: 3,
    bank_name: 'SBI',
    bank_logo: '/images/banks/sbi.png',
    offer_type: 'Government Employee',
    interest_rate: 7.75,
    description: 'Special rates for govt employees',
    features: ['Lowest interest rates', 'Extended repayment', 'Special govt scheme'],
    eligibility: 'Government employees only',
    processing_time: '2-3 working days',
    rating: 4.7,
    max_loan_amount: 1000000,
    min_loan_amount: 50000,
    max_tenure_months: 84,
    processing_fee: 500,
    location: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune']
  },
  {
    id: 4,
    bank_name: 'ICICI Bank',
    bank_logo: '/images/banks/icici.png',
    offer_type: 'Festive Offer',
    interest_rate: 8.99,
    description: 'Limited time festive offer',
    features: ['Cashback up to ₹10,000', 'Free insurance', 'Extended warranty'],
    eligibility: 'Minimum income ₹30,000/month',
    processing_time: '24 hours',
    rating: 4.5,
    max_loan_amount: 750000,
    min_loan_amount: 75000,
    max_tenure_months: 60,
    processing_fee: 1500,
    location: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad']
  },
  {
    id: 5,
    bank_name: 'Kotak Mahindra Bank',
    bank_logo: '/images/banks/kotak.png',
    offer_type: 'Premium Customer',
    interest_rate: 8.25,
    description: 'Exclusive rates for premium customers',
    features: ['Relationship pricing', 'Priority processing', 'Dedicated RM support'],
    eligibility: 'Existing premium account holders',
    processing_time: '12-24 hours',
    rating: 4.4,
    max_loan_amount: 2000000,
    min_loan_amount: 100000,
    max_tenure_months: 72,
    processing_fee: 2000,
    location: ['Delhi', 'Mumbai', 'Bangalore', 'Pune']
  },
  {
    id: 6,
    bank_name: 'Axis Bank',
    bank_logo: '/images/banks/axis.png',
    offer_type: 'Quick Approval',
    interest_rate: 9.25,
    description: 'Get approval in 15 minutes',
    features: ['15-minute approval', 'Digital journey', 'Minimal documentation'],
    eligibility: 'Minimum income ₹25,000/month',
    processing_time: '15 minutes',
    rating: 4.3,
    max_loan_amount: 400000,
    min_loan_amount: 40000,
    max_tenure_months: 48,
    processing_fee: 1200,
    location: ['All major cities']
  }
];

// Sample discount offers data
const discountOffersData = [
  {
    id: 1,
    title: 'Festive Season Bonanza',
    discount_amount: 15000,
    discount_type: 'Cashback',
    description: 'Get up to ₹15,000 cashback on select bike models',
    valid_till: '2024-12-31',
    applicable_brands: ['Hero', 'Honda', 'TVS'],
    terms: ['Valid for new bookings only', 'Cannot be combined with other offers', 'T&C apply'],
    image: '/images/offers/festive-offer.jpg',
    locations: ['All India']
  },
  {
    id: 2,
    title: 'Exchange Bonus',
    discount_amount: 25000,
    discount_type: 'Exchange',
    description: 'Extra exchange value for your old bike',
    valid_till: '2024-11-30',
    applicable_brands: ['Royal Enfield', 'Bajaj', 'Yamaha'],
    terms: ['Valid for bikes older than 3 years', 'Subject to bike condition', 'Verification required'],
    image: '/images/offers/exchange-offer.jpg',
    locations: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai']
  },
  {
    id: 3,
    title: 'Corporate Discount',
    discount_amount: 8000,
    discount_type: 'Corporate',
    description: 'Special discount for corporate employees',
    valid_till: '2024-12-15',
    applicable_brands: ['All Brands'],
    terms: ['Valid employee ID required', 'Minimum salary ₹40,000', 'Company tie-up required'],
    image: '/images/offers/corporate-offer.jpg',
    locations: ['All major cities']
  },
  {
    id: 4,
    title: 'First Time Buyer',
    discount_amount: 5000,
    discount_type: 'New Customer',
    description: 'Special offer for first-time bike buyers',
    valid_till: '2024-12-25',
    applicable_brands: ['Hero', 'Honda', 'TVS', 'Bajaj'],
    terms: ['First bike purchase only', 'Age limit 18-35 years', 'Valid documents required'],
    image: '/images/offers/first-buyer-offer.jpg',
    locations: ['All India']
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse parameters
    const type = searchParams.get('type') || 'finance'; // 'finance' or 'discount'
    const location = searchParams.get('location');
    const bank = searchParams.get('bank');
    const minRate = searchParams.get('minRate') ? Number(searchParams.get('minRate')) : undefined;
    const maxRate = searchParams.get('maxRate') ? Number(searchParams.get('maxRate')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'interest_rate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const limit = Number(searchParams.get('limit')) || 50;

    if (type === 'discount') {
      // Return discount offers
      let filteredOffers = [...discountOffersData];

      if (location && location !== 'all') {
        filteredOffers = filteredOffers.filter(offer => 
          offer.locations.includes('All India') || 
          offer.locations.some(loc => loc.toLowerCase().includes(location.toLowerCase()))
        );
      }

      // Sort by discount amount
      filteredOffers.sort((a, b) => {
        const comparison = a.discount_amount - b.discount_amount;
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      if (limit > 0) {
        filteredOffers = filteredOffers.slice(0, limit);
      }

      return successResponse({
        offers: filteredOffers,
        total: filteredOffers.length,
        type: 'discount'
      });
    }

    // Return finance offers (default)
    let filteredOffers = [...financeOffersData];

    // Apply filters
    if (location && location !== 'all') {
      filteredOffers = filteredOffers.filter(offer => 
        offer.location.includes('All India') || 
        offer.location.some(loc => loc.toLowerCase().includes(location.toLowerCase()))
      );
    }

    if (bank && bank !== 'all') {
      filteredOffers = filteredOffers.filter(offer => 
        offer.bank_name.toLowerCase().includes(bank.toLowerCase())
      );
    }

    if (minRate !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.interest_rate >= minRate);
    }

    if (maxRate !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.interest_rate <= maxRate);
    }

    // Apply sorting
    filteredOffers.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'interest_rate':
          comparison = a.interest_rate - b.interest_rate;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'bank_name':
          comparison = a.bank_name.localeCompare(b.bank_name);
          break;
        case 'max_loan_amount':
          comparison = a.max_loan_amount - b.max_loan_amount;
          break;
        default:
          comparison = a.interest_rate - b.interest_rate;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply limit
    if (limit > 0) {
      filteredOffers = filteredOffers.slice(0, limit);
    }

    return successResponse({
      offers: filteredOffers,
      total: filteredOffers.length,
      type: 'finance',
      filters: {
        location,
        bank,
        minRate,
        maxRate,
        sortBy,
        sortOrder,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching finance offers:', error);
    return errorResponse('Failed to fetch finance offers', 500);
  }
}

// Calculate EMI
export async function POST(request: Request) {
  try {
    const { loanAmount, interestRate, tenureMonths } = await request.json();
    
    if (!loanAmount || !interestRate || !tenureMonths) {
      return errorResponse('Missing required parameters for EMI calculation', 400);
    }

    // EMI calculation formula: [P x R x (1+R)^N] / [(1+R)^N-1]
    const principal = Number(loanAmount);
    const monthlyRate = Number(interestRate) / 12 / 100;
    const tenure = Number(tenureMonths);
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;

    return successResponse({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principal,
      interestRate: Number(interestRate),
      tenureMonths: tenure
    });

  } catch (error) {
    console.error('Error calculating EMI:', error);
    return errorResponse('Failed to calculate EMI', 500);
  }
}