import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

// Sample offers data - in a real app, this would come from a database
const offersData = [
  {
    id: 1,
    title: 'Year End Mega Sale',
    type: 'seasonal',
    discount_percent: 10.5,
    discount_amount: 7856,
    bike: {
      variant_id: 'hero-splendor-plus-std',
      variant_name: 'Hero Splendor Plus',
      brand_name: 'Hero',
      original_price: 74856,
      offer_price: 67000,
      image_url: '/images/bikes/hero-splendor-plus.jpg'
    },
    valid_till: '2024-12-31',
    location: 'Delhi',
    dealer_name: 'Hero World',
    features: ['Free Registration', '2 Year Extended Warranty', 'Free Service Kit'],
    terms: ['Valid for new bookings only', 'Cannot be combined with other offers', 'T&C apply']
  },
  {
    id: 2,
    title: 'Festival Special Offer',
    type: 'festival',
    discount_percent: 7.4,
    discount_amount: 5684,
    bike: {
      variant_id: 'honda-activa-6g-std',
      variant_name: 'Honda Activa 6G',
      brand_name: 'Honda',
      original_price: 76684,
      offer_price: 71000,
      image_url: '/images/bikes/honda-activa-6g.jpg'
    },
    valid_till: '2024-11-15',
    location: 'Mumbai',
    dealer_name: 'Honda Galaxy',
    features: ['Free Helmet', 'Free Insurance', 'Extended Warranty'],
    terms: ['Valid till stocks last', 'Age limit 18-65 years', 'Valid documents required']
  },
  {
    id: 3,
    title: 'Exchange Bonanza',
    type: 'exchange',
    discount_percent: 9.3,
    discount_amount: 18000,
    bike: {
      variant_id: 're-classic-350-std',
      variant_name: 'Royal Enfield Classic 350',
      brand_name: 'Royal Enfield',
      original_price: 193000,
      offer_price: 175000,
      image_url: '/images/bikes/re-classic-350.jpg'
    },
    valid_till: '2024-12-20',
    location: 'Bangalore',
    dealer_name: 'RE Store',
    features: ['Exchange Bonus ₹15,000', 'Zero Down Payment', 'Free Accessories Kit'],
    terms: ['Valid for bikes older than 3 years', 'Subject to bike condition', 'Verification required']
  },
  {
    id: 4,
    title: 'Corporate Discount',
    type: 'corporate',
    discount_percent: 6.5,
    discount_amount: 6389,
    bike: {
      variant_id: 'tvs-raider-125-std',
      variant_name: 'TVS Raider 125',
      brand_name: 'TVS',
      original_price: 98389,
      offer_price: 92000,
      image_url: '/images/bikes/tvs-raider.jpg'
    },
    valid_till: '2024-12-10',
    location: 'Chennai',
    dealer_name: 'TVS Motors',
    features: ['Corporate Discount', 'Easy Financing', 'Free Service Package'],
    terms: ['Valid employee ID required', 'Minimum salary ₹40,000', 'Company tie-up required']
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const brand = searchParams.get('brand');
    const minDiscount = searchParams.get('minDiscount') ? Number(searchParams.get('minDiscount')) : undefined;
    const maxDiscount = searchParams.get('maxDiscount') ? Number(searchParams.get('maxDiscount')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'discount_amount';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = Number(searchParams.get('limit')) || 50;

    let filteredOffers = [...offersData];

    // Apply filters
    if (type && type !== 'all') {
      filteredOffers = filteredOffers.filter(offer => offer.type === type);
    }

    if (location && location !== 'all') {
      filteredOffers = filteredOffers.filter(offer => 
        offer.location.toLowerCase() === location.toLowerCase()
      );
    }

    if (brand && brand !== 'all') {
      filteredOffers = filteredOffers.filter(offer => 
        offer.bike.brand_name.toLowerCase() === brand.toLowerCase()
      );
    }

    if (minDiscount !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.discount_percent >= minDiscount);
    }

    if (maxDiscount !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.discount_percent <= maxDiscount);
    }

    // Apply sorting
    filteredOffers.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'discount_amount':
          comparison = a.discount_amount - b.discount_amount;
          break;
        case 'discount_percent':
          comparison = a.discount_percent - b.discount_percent;
          break;
        case 'price':
          comparison = a.bike.offer_price - b.bike.offer_price;
          break;
        case 'name':
          comparison = a.bike.variant_name.localeCompare(b.bike.variant_name);
          break;
        default:
          comparison = a.discount_amount - b.discount_amount;
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
      filters: {
        type,
        location,
        brand,
        minDiscount,
        maxDiscount,
        sortBy,
        sortOrder,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching bike offers:', error);
    return errorResponse('Failed to fetch bike offers', 500);
  }
}

// Get offer by ID
export async function POST(request: Request) {
  try {
    const { offerId } = await request.json();
    
    const offer = offersData.find(o => o.id === offerId);
    
    if (!offer) {
      return errorResponse('Offer not found', 404);
    }

    return successResponse({ offer });

  } catch (error) {
    console.error('Error fetching specific offer:', error);
    return errorResponse('Failed to fetch offer details', 500);
  }
}