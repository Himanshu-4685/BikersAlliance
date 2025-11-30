import { NextRequest, NextResponse } from 'next/server';

// Define the Showroom type
export interface Showroom {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  contact: {
    phone: string[];
    email: string;
    website?: string;
  };
  timings: {
    weekdays: string;
    weekends: string;
    holidays?: string;
  };
  services: string[];
  image: string;
  rating: number;
  reviews: number;
  verified: boolean;
  featured: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  established?: string;
  areaServed?: string[];
}

// Sample showrooms data
const showrooms: Showroom[] = [
  {
    id: '1',
    name: 'Honda Galaxy Motors',
    slug: 'honda-galaxy-motors-delhi',
    brand: {
      id: 'honda',
      name: 'Honda',
      slug: 'honda',
      logo: '/brand-images/honda.avif'
    },
    address: {
      street: 'A-25, Sector 63',
      area: 'Noida',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Near Metro Station'
    },
    contact: {
      phone: ['+91-9876543210', '+91-11-26574890'],
      email: 'info@hondagalaxy.com',
      website: 'www.hondagalaxy.com'
    },
    timings: {
      weekdays: '9:00 AM - 8:00 PM',
      weekends: '9:00 AM - 7:00 PM',
      holidays: 'Closed on National Holidays'
    },
    services: ['Sales', 'Service', 'Spare Parts', 'Accessories', 'Insurance', 'Finance'],
    image: '/images/showrooms/honda-galaxy.jpg',
    rating: 4.5,
    reviews: 324,
    verified: true,
    featured: true,
    coordinates: {
      lat: 28.6139,
      lng: 77.2090
    },
    description: 'Premium Honda authorized dealer with state-of-the-art facility and expert technicians.',
    established: '2010',
    areaServed: ['Delhi', 'Noida', 'Ghaziabad', 'Faridabad']
  },
  {
    id: '2',
    name: 'Royal Enfield Store',
    slug: 'royal-enfield-store-mumbai',
    brand: {
      id: 'royal-enfield',
      name: 'Royal Enfield',
      slug: 'royal-enfield',
      logo: '/brand-images/royal-enfield.avif'
    },
    address: {
      street: 'Shop No. 15, Ground Floor',
      area: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      landmark: 'Opposite Bandra Station'
    },
    contact: {
      phone: ['+91-9876543211', '+91-22-26574891'],
      email: 'mumbai@royalenfield.com',
      website: 'www.royalenfield.com'
    },
    timings: {
      weekdays: '10:00 AM - 9:00 PM',
      weekends: '10:00 AM - 8:00 PM'
    },
    services: ['Sales', 'Service', 'Genuine Parts', 'Accessories', 'Gear & Apparel'],
    image: '/images/showrooms/re-store.jpg',
    rating: 4.7,
    reviews: 189,
    verified: true,
    featured: true,
    coordinates: {
      lat: 19.0596,
      lng: 72.8295
    },
    description: 'Experience the Royal Enfield legacy with our exclusive store featuring the complete range.',
    established: '2015',
    areaServed: ['Mumbai', 'Thane', 'Navi Mumbai']
  },
  {
    id: '3',
    name: 'TVS Motors Hub',
    slug: 'tvs-motors-hub-bangalore',
    brand: {
      id: 'tvs',
      name: 'TVS',
      slug: 'tvs',
      logo: '/brand-images/tvs.avif'
    },
    address: {
      street: '234, MG Road',
      area: 'Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      landmark: 'Near Commercial Street'
    },
    contact: {
      phone: ['+91-9876543212', '+91-80-26574892'],
      email: 'bangalore@tvsmotors.com'
    },
    timings: {
      weekdays: '9:30 AM - 8:30 PM',
      weekends: '9:30 AM - 7:30 PM'
    },
    services: ['Sales', 'Service', 'Spare Parts', 'Accessories', 'Test Ride'],
    image: '/images/showrooms/tvs-hub.jpg',
    rating: 4.3,
    reviews: 256,
    verified: true,
    featured: false,
    coordinates: {
      lat: 12.9716,
      lng: 77.5946
    },
    description: 'Your trusted TVS partner with comprehensive sales and service solutions.',
    established: '2012',
    areaServed: ['Bangalore', 'Mysore', 'Hubli']
  },
  {
    id: '4',
    name: 'Hero MotoCorp World',
    slug: 'hero-motocorp-world-chennai',
    brand: {
      id: 'hero',
      name: 'Hero',
      slug: 'hero',
      logo: '/brand-images/hero.avif'
    },
    address: {
      street: '45, Anna Salai',
      area: 'Mount Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600002',
      landmark: 'Near Spencer Plaza'
    },
    contact: {
      phone: ['+91-9876543213', '+91-44-26574893'],
      email: 'chennai@heromotocorp.com',
      website: 'www.heromotocorp.com'
    },
    timings: {
      weekdays: '9:00 AM - 8:00 PM',
      weekends: '9:00 AM - 7:00 PM'
    },
    services: ['Sales', 'Service', 'Spare Parts', 'Insurance', 'Finance', 'Exchange'],
    image: '/images/showrooms/hero-world.jpg',
    rating: 4.4,
    reviews: 412,
    verified: true,
    featured: true,
    coordinates: {
      lat: 13.0827,
      lng: 80.2707
    },
    description: 'Experience Hero\'s complete range of motorcycles and scooters with expert guidance.',
    established: '2008',
    areaServed: ['Chennai', 'Coimbatore', 'Madurai']
  },
  {
    id: '5',
    name: 'Bajaj Auto Centre',
    slug: 'bajaj-auto-centre-pune',
    brand: {
      id: 'bajaj',
      name: 'Bajaj',
      slug: 'bajaj',
      logo: '/brand-images/bajaj.avif'
    },
    address: {
      street: '78, FC Road',
      area: 'Deccan Gymkhana',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      landmark: 'Near Fergusson College'
    },
    contact: {
      phone: ['+91-9876543214', '+91-20-26574894'],
      email: 'pune@bajajauto.com'
    },
    timings: {
      weekdays: '9:00 AM - 8:00 PM',
      weekends: '9:00 AM - 6:00 PM'
    },
    services: ['Sales', 'Service', 'Spare Parts', 'Accessories', 'Finance'],
    image: '/images/showrooms/bajaj-centre.jpg',
    rating: 4.2,
    reviews: 198,
    verified: true,
    featured: false,
    coordinates: {
      lat: 18.5204,
      lng: 73.8567
    },
    description: 'Authorized Bajaj dealer offering the complete range of motorcycles and three-wheelers.',
    established: '2014',
    areaServed: ['Pune', 'Nashik', 'Aurangabad']
  },
  {
    id: '6',
    name: 'Yamaha Blue Square',
    slug: 'yamaha-blue-square-hyderabad',
    brand: {
      id: 'yamaha',
      name: 'Yamaha',
      slug: 'yamaha',
      logo: '/brand-images/yamaha.avif'
    },
    address: {
      street: '102, Cyber Towers',
      area: 'HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      landmark: 'Near Cyber Gateway'
    },
    contact: {
      phone: ['+91-9876543215', '+91-40-26574895'],
      email: 'hyderabad@yamaha-motor.com',
      website: 'www.yamaha-motor.co.in'
    },
    timings: {
      weekdays: '10:00 AM - 8:00 PM',
      weekends: '10:00 AM - 7:00 PM'
    },
    services: ['Sales', 'Service', 'Genuine Parts', 'Accessories', 'Test Ride'],
    image: '/images/showrooms/yamaha-square.jpg',
    rating: 4.6,
    reviews: 278,
    verified: true,
    featured: true,
    coordinates: {
      lat: 17.4485,
      lng: 78.3908
    },
    description: 'Premium Yamaha dealership with modern facility and trained professionals.',
    established: '2016',
    areaServed: ['Hyderabad', 'Secunderabad', 'Warangal']
  },
  {
    id: '7',
    name: 'KTM Performance Centre',
    slug: 'ktm-performance-centre-gurgaon',
    brand: {
      id: 'ktm',
      name: 'KTM',
      slug: 'ktm',
      logo: '/brand-images/ktm.avif'
    },
    address: {
      street: 'Unit 12, Sector 29',
      area: 'Leisure Valley Road',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001',
      landmark: 'Near Ambience Mall'
    },
    contact: {
      phone: ['+91-9876543216', '+91-124-26574896'],
      email: 'gurgaon@ktm.com',
      website: 'www.ktm.com'
    },
    timings: {
      weekdays: '10:00 AM - 8:00 PM',
      weekends: '10:00 AM - 7:00 PM'
    },
    services: ['Sales', 'Service', 'Performance Parts', 'Racing Accessories', 'Track Support'],
    image: '/images/showrooms/ktm-centre.jpg',
    rating: 4.8,
    reviews: 156,
    verified: true,
    featured: true,
    coordinates: {
      lat: 28.4595,
      lng: 77.0266
    },
    description: 'Experience the thrill of KTM with our performance-focused dealership.',
    established: '2018',
    areaServed: ['Gurgaon', 'Delhi', 'Faridabad']
  },
  {
    id: '8',
    name: 'Suzuki Motorcycle India',
    slug: 'suzuki-motorcycle-india-kolkata',
    brand: {
      id: 'suzuki',
      name: 'Suzuki',
      slug: 'suzuki',
      logo: '/brand-images/suzuki.avif'
    },
    address: {
      street: '56, Park Street',
      area: 'Park Circus',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
      landmark: 'Near South City Mall'
    },
    contact: {
      phone: ['+91-9876543217', '+91-33-26574897'],
      email: 'kolkata@suzukimotorcycle.co.in'
    },
    timings: {
      weekdays: '9:30 AM - 7:30 PM',
      weekends: '9:30 AM - 6:30 PM'
    },
    services: ['Sales', 'Service', 'Spare Parts', 'Accessories', 'Insurance'],
    image: '/images/showrooms/suzuki-india.jpg',
    rating: 4.1,
    reviews: 143,
    verified: true,
    featured: false,
    coordinates: {
      lat: 22.5726,
      lng: 88.3639
    },
    description: 'Authorized Suzuki dealer providing quality motorcycles and reliable service.',
    established: '2013',
    areaServed: ['Kolkata', 'Durgapur', 'Siliguri']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const city = searchParams.get('city');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredShowrooms = [...showrooms];

    // Apply filters
    if (city) {
      filteredShowrooms = filteredShowrooms.filter(showroom => 
        showroom.address.city.toLowerCase().includes(city.toLowerCase()) ||
        showroom.areaServed?.some(area => area.toLowerCase().includes(city.toLowerCase()))
      );
    }

    if (brand) {
      filteredShowrooms = filteredShowrooms.filter(showroom => 
        showroom.brand.slug === brand.toLowerCase()
      );
    }

    if (featured === 'true') {
      filteredShowrooms = filteredShowrooms.filter(showroom => showroom.featured);
    }

    if (verified === 'true') {
      filteredShowrooms = filteredShowrooms.filter(showroom => showroom.verified);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredShowrooms = filteredShowrooms.filter(showroom => 
        showroom.name.toLowerCase().includes(searchLower) ||
        showroom.brand.name.toLowerCase().includes(searchLower) ||
        showroom.address.area.toLowerCase().includes(searchLower) ||
        showroom.address.city.toLowerCase().includes(searchLower)
      );
    }

    // Sort by featured first, then by rating
    filteredShowrooms.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });

    // Pagination
    const total = filteredShowrooms.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedShowrooms = filteredShowrooms.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedShowrooms,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        cities: Array.from(new Set(showrooms.map(s => s.address.city))),
        brands: Array.from(new Set(showrooms.map(s => s.brand.id)))
          .map(brandId => showrooms.find(s => s.brand.id === brandId)?.brand)
          .filter((brand): brand is NonNullable<typeof brand> => brand !== undefined)
      }
    });

  } catch (error) {
    console.error('Error fetching showrooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showrooms' },
      { status: 500 }
    );
  }
}