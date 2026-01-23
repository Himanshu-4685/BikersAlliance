'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

// Types for brands and models
interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  brandId: string;
}

export default function Hero() {
  const router = useRouter();
  const [bikeType, setBikeType] = useState('new');
  const [searchBy, setSearchBy] = useState('budget');
  const [currentImage, setCurrentImage] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Data state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Popular cities for used bikes
  const popularCities = [
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'pune', 'chennai',
    'kolkata', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur',
    'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad',
    'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
    'faridabad', 'meerut', 'rajkot', 'kalyan-dombivali', 'vasai-virar',
    'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar',
    'navi-mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore',
    'jabalpur', 'gwalior', 'vijayawada', 'jodhpur', 'madurai',
    'raipur', 'kota', 'guwahati', 'chandigarh', 'solapur'
  ];

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      setBrandsLoading(true);
      try {
        const response = await fetch('/api/brands?limit=100');
        const result = await response.json();
        
        if (result.success && result.data?.brands) {
          setBrands(result.data.brands);
        } else {
          console.error('Failed to fetch brands:', result.error);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setBrandsLoading(false);
      }
    };
    
    fetchBrands();
  }, []);

  // Fetch models when brand is selected
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedBrand) {
        setModels([]);
        setSelectedModel('');
        return;
      }
      
      setModelsLoading(true);
      try {
        // Find the selected brand to get its ID
        const brand = brands.find(b => b.slug === selectedBrand);
        if (!brand) return;
        
        const response = await fetch(`/api/models?brandId=${brand.id}&limit=100`);
        const result = await response.json();
        
        if (result.success && result.data?.models) {
          setModels(result.data.models);
        } else {
          console.error('Failed to fetch models:', result.error);
          setModels([]);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels([]);
      } finally {
        setModelsLoading(false);
      }
    };
    
    fetchModels();
  }, [selectedBrand, brands]);

  // Fetch hero images from API
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        console.log('Fetching hero images from API...');
        
        const response = await fetch('/api/hero-images');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success && data.images && data.images.length > 0) {
          console.log(`Successfully loaded ${data.count} hero images:`, data.images);
          setHeroImages(data.images);
        } else {
          console.error('API could not fetch hero images:', data.error || 'Unknown error');
          
          // Fallback: Use known working URLs if API fails
          console.log('Using fallback images...');
          const fallbackImages = [
            'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/Ampere-Magnus-Grand.avif',
            'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/Hero-Destini-110_Desktop_1686x548px.avif',
            'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/kawa.jpg',
            'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/TVS XL100.avif',
            'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/Ultraviolette-X47-Crossover_Desktop_1686x548px.avif'
          ];
          setHeroImages(fallbackImages);
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
        
        // Fallback on any error
        console.log('Using fallback images due to error...');
        const fallbackImages = [
          'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/Ampere-Magnus-Grand.avif',
          'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/Hero-Destini-110_Desktop.avif',
          'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/kawa.jpg',
          'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/TVS XL100.avif',
          'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/Ultraviolette-X47-Crossover_Desktop_1686x548px.avif'
        ];
        setHeroImages(fallbackImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  // Navigation functions
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle used bike search - navigate to city page
    if (bikeType === 'used') {
      if (selectedCity) {
        router.push(`/used-bikes/${selectedCity}`);
      }
      return;
    }

    // Handle new bike search
    const params = new URLSearchParams();
    
    if (searchBy === 'brand') {
      if (selectedBrand) {
        // Find the brand name from slug
        const brand = brands.find(b => b.slug === selectedBrand);
        if (brand) {
          params.append('brand', brand.name);
        }
      }
      
      if (selectedType) {
        params.append('bodyType', selectedType);
      }
    } else {
      // Budget search
      if (selectedBudget) {
        const budgetRanges: { [key: string]: { min?: number; max?: number } } = {
          'under-50000': { max: 50000 },
          '50000-100000': { min: 50000, max: 100000 },
          '100000-150000': { min: 100000, max: 150000 },
          'above-150000': { min: 150000 }
        };
        
        const range = budgetRanges[selectedBudget];
        if (range) {
          if (range.min) params.append('minPrice', range.min.toString());
          if (range.max) params.append('maxPrice', range.max.toString());
        }
      }
      
      if (selectedType) {
        params.append('bodyType', selectedType);
      }
    }
    
    // Navigate to all bikes page with filters
    const url = `/bikes/all${params.toString() ? '?' + params.toString() : ''}`;
    router.push(url);
  };

  // Handle Advanced Search navigation
  const handleAdvancedSearch = () => {
    router.push('/bikes/all');
  };
  
  return (
    <section className="relative h-[500px] bg-gray-50">
      <div className="container h-full">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          {/* Hero Background Carousel */}
          <div className="absolute inset-0 z-0">
            {isLoading ? (
              // Loading fallback
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            ) : heroImages.length > 0 ? (
              // Carousel Images
              <>
                {heroImages.map((imageUrl, index) => (
                  <Image
                    key={index}
                    src={imageUrl}
                    alt={`Hero Image ${index + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-1000 ${
                      index === currentImage ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ objectPosition: 'center' }}
                    priority={index === 0}
                  />
                ))}
                
                {/* Navigation Arrows */}
                {heroImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
                    >
                      <FiChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
                    >
                      <FiChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Dots Indicator */}
                {heroImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentImage
                            ? 'bg-white'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Fallback image
              <Image 
                src="/images/hero/kawa.jpg" 
                alt="Featured Motorcycle"
                fill
                className="object-cover"
                style={{ objectPosition: 'center right' }}
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          </div>
          
          {/* Form Container - Styled exactly as per image */}
          <div 
            className="absolute z-100" 
            style={{
              left: '90px',
              top: '54px',
              width: '348px',
              height: 'auto',
              padding: '19px 24px 24px',
              borderRadius: '16px',
              boxShadow: '0px 0px 70px 0px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              fontFamily: 'Lato, sans-serif, Arial',
              fontSize: '13px',
              lineHeight: '19.5px',
              fontWeight: 400,
              position: 'absolute',
              display: 'block',
              boxSizing: 'border-box',
              unicodeBidi: 'isolate'
            }}
          >
            <h2 className="text-2xl font-medium mb-4">Search the right bike</h2>
            
            {/* New/Used Toggle */}
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => setBikeType('new')}
                className={`px-5 py-2.5 text-sm font-medium rounded-md mr-2 ${
                  bikeType === 'new'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ minWidth: '110px' }}
              >
                New Bike
              </button>
              <button
                type="button"
                onClick={() => setBikeType('used')}
                className={`px-5 py-2.5 text-sm font-medium rounded-md ${
                  bikeType === 'used'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ minWidth: '110px' }}
              >
                Used Bike
              </button>
            </div>

            {/* Conditional Content Based on Bike Type */}
            {bikeType === 'used' ? (
              /* Used Bike - City Selection Only */
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-3">
                  <div>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D02F2F] focus:border-[#D02F2F] text-gray-500"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="">Select City</option>
                      {popularCities.map((city) => (
                        <option key={city} value={city}>
                          {city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Search Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#D02F2F] text-white rounded-md font-medium hover:bg-[#B82929] transition duration-150"
                    disabled={!selectedCity}
                  >
                    Search Used Bikes
                  </button>
                </div>
              </form>
            ) : (
              /* New Bike - Original Form */
              <>
                {/* Radio Buttons */}
                <div className="mb-3">
                  <div className="flex space-x-6">
                    <div className="flex items-center">
                      <input
                        id="by-brand"
                        name="search-by"
                        type="radio"
                        checked={searchBy === 'brand'}
                        onChange={() => setSearchBy('brand')}
                        className="h-4 w-4 text-[#D02F2F] border-gray-300 focus:ring-[#D02F2F]"
                      />
                      <label htmlFor="by-brand" className="ml-2 text-sm text-gray-900">
                        By Brand
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="by-budget"
                        name="search-by"
                        type="radio"
                        checked={searchBy === 'budget'}
                        onChange={() => setSearchBy('budget')}
                        className="h-4 w-4 text-[#D02F2F] border-gray-300 focus:ring-[#D02F2F]"
                      />
                      <label htmlFor="by-budget" className="ml-2 text-sm text-gray-900">
                        By Budget
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Selects */}
                <form onSubmit={handleFormSubmit}>
                  <div className="space-y-3">
                    {searchBy === 'brand' ? (
                      <>
                        <div>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D02F2F] focus:border-[#D02F2F] text-gray-500"
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            disabled={brandsLoading}
                          >
                            <option value="">
                              {brandsLoading ? 'Loading brands...' : 'Select Brand'}
                            </option>
                            {brands.map((brand) => (
                              <option key={brand.id} value={brand.slug}>
                                {brand.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D02F2F] focus:border-[#D02F2F] text-gray-500"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                          >
                            <option value="">Select Type</option>
                            <option value="commuter">Commuter</option>
                            <option value="sports">Sports</option>
                            <option value="cruiser">Cruiser</option>
                            <option value="adventure">Adventure</option>
                            <option value="scooter">Scooter</option>
                            <option value="off-road">Off-Road</option>
                            <option value="electric">Electric</option>
                            <option value="moped">Moped</option>
                            <option value="naked">Naked</option>
                            <option value="touring">Touring</option>
                            <option value="street">Street</option>
                            <option value="roadster">Roadster</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-500"
                            value={selectedBudget}
                            onChange={(e) => setSelectedBudget(e.target.value)}
                          >
                            <option value="">Select Budget</option>
                            <option value="under-50000">Under ₹50,000</option>
                            <option value="50000-100000">₹50,000 - ₹1 Lakh</option>
                            <option value="100000-150000">₹1 Lakh - ₹1.5 Lakh</option>
                            <option value="above-150000">Above ₹1.5 Lakh</option>
                          </select>
                        </div>
                        
                        <div>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-500"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                          >
                            <option value="">Select Type</option>
                            <option value="commuter">Commuter</option>
                            <option value="sports">Sports</option>
                            <option value="cruiser">Cruiser</option>
                            <option value="adventure">Adventure</option>
                            <option value="scooter">Scooter</option>
                            <option value="off-road">Off-Road</option>
                            <option value="electric">Electric</option>
                            <option value="moped">Moped</option>
                            <option value="naked">Naked</option>
                            <option value="touring">Touring</option>
                            <option value="street">Street</option>
                            <option value="roadster">Roadster</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    {/* Search Button */}
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#D02F2F] text-white rounded-md font-medium hover:bg-[#B82929] transition duration-150"
                      disabled={searchBy === 'brand' ? (!selectedBrand || !selectedType) : (!selectedBudget && !selectedType)}
                    >
                      Search
                    </button>
                  </div>
                  
                  {/* Advanced Search Link */}
                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      onClick={handleAdvancedSearch}
                      className="text-gray-500 text-sm hover:text-[#D02F2F] bg-transparent border-0 p-0"
                    >
                      Advanced Search →
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}