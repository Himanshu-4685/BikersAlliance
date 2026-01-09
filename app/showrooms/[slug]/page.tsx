'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiStar, 
  FiExternalLink,
  FiCheckCircle,
  FiTrendingUp,
  FiArrowLeft,
  FiNavigation,
  FiCalendar,
  FiUsers,
  FiAward,
  FiShield
} from 'react-icons/fi';

// Types
interface Showroom {
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



export default function ShowroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowroom = async () => {
      try {
        setLoading(true);
        // In a real app, this would be a dedicated API endpoint for individual showrooms
        const response = await fetch('/api/showrooms');
        
        if (!response.ok) {
          throw new Error('Failed to fetch showroom');
        }
        
        const data = await response.json();
        const foundShowroom = data.data.find((s: Showroom) => s.slug === params.slug);
        
        if (!foundShowroom) {
          throw new Error('Showroom not found');
        }
        
        setShowroom(foundShowroom);
        setError(null);
      } catch (err) {
        console.error('Error fetching showroom:', err);
        setError('Failed to load showroom details.');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchShowroom();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-8">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !showroom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Showroom Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The showroom you are looking for does not exist.'}</p>
          <Link
            href="/showrooms"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Showrooms
          </Link>
        </div>
      </div>
    );
  }

  const openInMaps = () => {
    if (showroom.coordinates) {
      const { lat, lng } = showroom.coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="container py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/showrooms" className="text-gray-500 hover:text-gray-700">Showrooms</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{showroom.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="aspect-[21/9] relative overflow-hidden bg-gray-200">
          <Image
            src="/s.avif"
            alt="Motorcycle Showroom"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-blue-700/50"></div>
          
          {/* Badges */}
          <div className="absolute top-6 left-6 flex gap-3">
            {showroom.featured && (
              <span className="bg-orange-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4" />
                Featured
              </span>
            )}
            {showroom.verified && (
              <span className="bg-green-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                Verified
              </span>
            )}
          </div>

          {/* Back Button */}
          <div className="absolute top-6 right-6">
            <button
              onClick={() => router.back()}
              className="bg-white bg-opacity-90 text-gray-900 px-4 py-2 rounded-lg hover:bg-opacity-100 transition-all flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image
                    src={showroom.brand.logo.replace('/brand-images/', '/images/brands/')}
                    alt={showroom.brand.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{showroom.name}</h1>
                  <p className="text-lg text-gray-600 mb-3">Authorized {showroom.brand.name} Dealer</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">{showroom.rating}</span>
                    </div>
                    <span className="text-gray-500">({showroom.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {showroom.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-600 leading-relaxed">{showroom.description}</p>
                </div>
              )}

              {/* Services */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Offered</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {showroom.services.map((service, index) => (
                    <div key={index} className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-center font-medium">
                      {service}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {showroom.established && (
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Established</p>
                      <p className="text-gray-600">{showroom.established}</p>
                    </div>
                  </div>
                )}
                
                {showroom.areaServed && (
                  <div className="flex items-start gap-3">
                    <FiUsers className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Areas Served</p>
                      <p className="text-gray-600">{showroom.areaServed.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>


            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                {/* Address */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600 leading-relaxed">
                        {showroom.address.street}<br />
                        {showroom.address.area}<br />
                        {showroom.address.city}, {showroom.address.state}<br />
                        {showroom.address.pincode}
                      </p>
                      {showroom.address.landmark && (
                        <p className="text-sm text-gray-500 mt-1">
                          Landmark: {showroom.address.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <FiPhone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      {showroom.contact.phone.map((phone, index) => (
                        <a
                          key={index}
                          href={`tel:${phone}`}
                          className="block text-blue-600 hover:text-blue-700"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a
                        href={`mailto:${showroom.contact.email}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {showroom.contact.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Website */}
                {showroom.contact.website && (
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <FiExternalLink className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Website</p>
                        <a
                          href={`https://${showroom.contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {showroom.contact.website}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timings</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Weekdays</p>
                      <p className="text-gray-600">{showroom.timings.weekdays}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Weekends</p>
                      <p className="text-gray-600">{showroom.timings.weekends}</p>
                    </div>
                  </div>
                  {showroom.timings.holidays && (
                    <div className="flex items-center gap-3">
                      <FiClock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Holidays</p>
                        <p className="text-gray-600">{showroom.timings.holidays}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={`tel:${showroom.contact.phone[0]}`}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiPhone className="w-5 h-5" />
                  Call Now
                </a>
                
                {showroom.coordinates && (
                  <button
                    onClick={openInMaps}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FiNavigation className="w-5 h-5" />
                    Get Directions
                  </button>
                )}
                
                <a
                  href={`mailto:${showroom.contact.email}`}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiMail className="w-5 h-5" />
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}