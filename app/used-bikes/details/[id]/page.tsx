'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiChevronRight, 
  FiTag, 
  FiCalendar, 
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiArrowLeft,
  FiShare2,
  FiHeart
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext.supabase';

// Types
interface UsedBikeDetails {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  expected_price: number;
  km_driven: number;
  fuel_type: string;
  ownership: string;
  transmission: string;
  category: string;
  condition: string;
  description?: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  has_rc: boolean;
  has_insurance: boolean;
  has_puc: boolean;
  photos: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export default function UsedBikeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bike, setBike] = useState<UsedBikeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchBikeDetails = async () => {
      try {
        const response = await fetch(`/api/used-bikes/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setBike(result.data);
        } else {
          setError(result.error || 'Failed to fetch bike details');
        }
      } catch (err) {
        console.error('Error fetching bike details:', err);
        setError('Failed to load bike details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBikeDetails();
    }
  }, [params.id]);

  // Handle contact seller
  const handleContactSeller = () => {
    if (!bike) return;
    
    // Create a mailto link with pre-filled information
    const subject = `Inquiry about ${bike.brand} ${bike.model} - ₹${bike.expected_price?.toLocaleString()}`;
    const body = `Hi ${bike.owner_name},\n\nI am interested in your ${bike.brand} ${bike.model}${bike.variant ? ` ${bike.variant}` : ''} listed for ₹${bike.expected_price?.toLocaleString()}.\n\nDetails:\n- Year: ${bike.year}\n- KM Driven: ${bike.km_driven?.toLocaleString()} km\n- Location: ${bike.city}, ${bike.state}\n\nPlease let me know if it's still available and we can discuss further.\n\nBest regards`;
    
    const mailtoLink = `mailto:${bike.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Handle share
  const handleShare = async () => {
    if (!bike) return;

    const shareData = {
      title: `${bike.brand} ${bike.model}${bike.variant ? ` ${bike.variant}` : ''} - ₹${bike.expected_price?.toLocaleString()}`,
      text: `Check out this ${bike.brand} ${bike.model} for sale in ${bike.city}`,
      url: window.location.href
    };

    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        alert('Failed to share. Please copy the URL manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bike Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested bike could not be found.'}</p>
          <Link 
            href="/used-bikes" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Used Bikes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <FiChevronRight size={14} />
            <Link href="/used-bikes" className="hover:text-blue-600">Used Bikes</Link>
            <FiChevronRight size={14} />
            <span className="text-gray-900">{bike.brand} {bike.model}</span>
          </div>
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft size={16} />
            Back to listings
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {bike.photos && bike.photos.length > 0 ? (
                  <Image
                    src={bike.photos[currentImageIndex]}
                    alt={`${bike.brand} ${bike.model}${bike.variant ? ` ${bike.variant}` : ''}`}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No images available
                  </div>
                )}
              </div>
              
              {bike.photos && bike.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {bike.photos.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${bike.brand} ${bike.model} - ${index + 1}`}
                        width={200}
                        height={113}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Specifications</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium">{bike.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model</span>
                    <span className="font-medium">{bike.model}{bike.variant && ` ${bike.variant}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year</span>
                    <span className="font-medium">{bike.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KM Driven</span>
                    <span className="font-medium">{bike.km_driven?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fuel Type</span>
                    <span className="font-medium">{bike.fuel_type}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ownership</span>
                    <span className="font-medium">{bike.ownership}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transmission</span>
                    <span className="font-medium">{bike.transmission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{bike.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-medium">{bike.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents</span>
                    <div className="text-right">
                      {bike.has_rc && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-1">RC</span>}
                      {bike.has_insurance && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-1">Insurance</span>}
                      {bike.has_puc && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">PUC</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {bike.description && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{bike.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Price and Contact */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ₹{bike.expected_price?.toLocaleString()}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <FiMapPin size={16} />
                  <span>{bike.city}, {bike.state}</span>
                </div>
              </div>

              {/* Owner Details */}
              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold mb-4">Seller Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {bike.owner_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{bike.owner_name}</div>
                      <div className="text-sm text-gray-600">Seller</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <a 
                      href={`tel:${bike.phone}`}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiPhone className="text-blue-600" />
                      <span>{bike.phone}</span>
                    </a>
                    
                    {bike.email && (
                      <a 
                        href={`mailto:${bike.email}`}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiMail className="text-blue-600" />
                        <span>{bike.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiCalendar size={14} />
                  <span>Listed on {new Date(bike.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTag size={14} />
                  <span>Status: {bike.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleContactSeller}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiPhone size={16} />
                  Contact Seller
                </button>
                
                <button 
                  onClick={handleShare}
                  className="w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FiShare2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}