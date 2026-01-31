'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useComparison } from '@/context/ComparisonContext';
import { useCompare, ComparisonVariant } from '@/hooks/useCompare';
import { useAuth } from '@/context/AuthContext.supabase';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiPlus, FiArrowLeft, FiChevronDown, FiBookmark, FiCheck } from 'react-icons/fi';

// Types for API responses
interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  slug: string;
}

interface Model {
  id: string;
  name: string;
  brandId: string;
  slug: string;
}

interface Variant {
  id: string;
  name: string;
  onRoadPrice: number;
  modelId: string;
  brandId: string;
  displacement?: string;
  peakPower?: string;
  cityMileage?: string;
  engineType?: string;
  bikeStyle?: string;
}

interface BikeSlot {
  variant: ComparisonVariant | null;
  selectedBrand: string;
  selectedModel: string;
  selectedVariant: string;
  showBrandDropdown: boolean;
  showModelDropdown: boolean;
  showVariantDropdown: boolean;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const { comparisonList, clearComparison, maxComparisons, setMaxComparisons, syncComparisonList } = useComparison();
  const { compareVariants, loading: compareLoading, error: compareError } = useCompare();
  const { user, isLoading: authLoading } = useAuth();
  
  // Dynamic number of slots based on maxComparisons
  const initializeSlots = (count: number): BikeSlot[] => {
    return Array(count).fill(null).map(() => ({
      variant: null,
      selectedBrand: '',
      selectedModel: '',
      selectedVariant: '',
      showBrandDropdown: false,
      showModelDropdown: false,
      showVariantDropdown: false
    }));
  };

  const [bikeSlots, setBikeSlots] = useState<BikeSlot[]>(initializeSlots(maxComparisons));
  const [comparisonData, setComparisonData] = useState<ComparisonVariant[]>([]);

  // Save comparison states
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Data states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<{ [brandId: string]: Model[] }>({});
  const [variants, setVariants] = useState<{ [modelId: string]: Variant[] }>({});
  const [loading, setLoading] = useState(false);

  // Update slots when maxComparisons changes
  useEffect(() => {
    setBikeSlots(prev => {
      const newSlots = initializeSlots(maxComparisons);
      // Copy existing data to new slots
      for (let i = 0; i < Math.min(prev.length, maxComparisons); i++) {
        newSlots[i] = prev[i];
      }
      return newSlots;
    });
  }, [maxComparisons]);

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Initialize comparison from context and fetch full comparison data
  useEffect(() => {
    const initializeFromContext = async () => {
      if (comparisonList.length > 0) {
        const variantIds = comparisonList.map(bike => bike.id);
        const data = await compareVariants(variantIds);
        
        if (data) {
          setComparisonData(data);
          
          // Update slots with comparison data
          const newSlots = initializeSlots(maxComparisons);
          data.forEach((variant, index) => {
            if (index < newSlots.length) {
              newSlots[index] = {
                variant,
                selectedBrand: variant.brand_name,
                selectedModel: variant.model_name,
                selectedVariant: variant.variant_name,
                showBrandDropdown: false,
                showModelDropdown: false,
                showVariantDropdown: false
              };
            }
          });
          setBikeSlots(newSlots);
        }
      } else {
        // If comparison list is empty, reset the bike slots
        setBikeSlots(initializeSlots(maxComparisons));
        setComparisonData([]);
      }
    };

    initializeFromContext();
  }, [comparisonList, maxComparisons]);

  // Handle URL parameters for direct comparison links (from saved comparisons)
  useEffect(() => {
    const loadFromURLParams = async () => {
      const variantsParam = searchParams.get('variants');
      if (variantsParam && comparisonList.length === 0) {
        const variantIds = variantsParam.split(',').filter(id => id.trim());
        if (variantIds.length > 0) {
          const data = await compareVariants(variantIds);
          
          if (data) {
            setComparisonData(data);
            
            // Update slots with data from URL
            const newSlots = initializeSlots(maxComparisons);
            data.forEach((variant, index) => {
              if (index < newSlots.length) {
                newSlots[index] = {
                  variant,
                  selectedBrand: variant.brand_name,
                  selectedModel: variant.model_name,
                  selectedVariant: variant.variant_name,
                  showBrandDropdown: false,
                  showModelDropdown: false,
                  showVariantDropdown: false
                };
              }
            });
            setBikeSlots(newSlots);
          }
        }
      }
    };

    loadFromURLParams();
  }, [searchParams]); // Only depend on searchParams

  // Fetch comparison data whenever slots change
  useEffect(() => {
    const variantIds = bikeSlots
      .filter(slot => slot.variant)
      .map(slot => slot.variant!.variant_id);
    
    if (variantIds.length > 0) {
      compareVariants(variantIds).then(data => {
        if (data) {
          setComparisonData(data);
        }
      });
    } else {
      setComparisonData([]);
    }
  }, [bikeSlots]);

  // Sync compare page selections with comparison context for the comparison bar
  useEffect(() => {
    const selectedBikes = bikeSlots
      .filter(slot => slot.variant)
      .map(slot => ({
        id: slot.variant!.variant_id,
        name: `${slot.variant!.brand_name} ${slot.variant!.model_name} ${slot.variant!.variant_name}`,
        slug: slot.variant!.variant_id,
        image: slot.variant!.image_url || '/demo.avif',
        price: slot.variant!.on_road_price || 0,
        brand: {
          name: slot.variant!.brand_name,
          slug: slot.variant!.brand_name.toLowerCase()
        }
      }));

    // Sync with comparison context for bar display
    syncComparisonList(selectedBikes);
  }, [bikeSlots.map(slot => slot.variant?.variant_id).join(',')]); // Only sync when actual variants change

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brands?limit=100');
      const data = await response.json();
      console.log('Brands API response:', data);
      if (data.success) {
        setBrands(data.data.brands);
        console.log('Brands set:', data.data.brands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (brandId: string) => {
    try {
      console.log('Fetching models for brand ID:', brandId);
      const response = await fetch(`/api/models?brandId=${brandId}&limit=100`);
      const data = await response.json();
      console.log('Models API response for brand', brandId, ':', data);
      if (data.success) {
        setModels(prev => ({ ...prev, [brandId]: data.data.models }));
        console.log('Models set for brand', brandId, ':', data.data.models);
      } else {
        console.error('Failed to fetch models:', data);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchVariants = async (modelId: string) => {
    try {
      console.log('Fetching variants for model ID:', modelId);
      const response = await fetch(`/api/bikes?model=${modelId}&limit=100`);
      const data = await response.json();
      console.log('Variants API response for model', modelId, ':', data);
      if (data.success) {
        setVariants(prev => ({ ...prev, [modelId]: data.data.bikes }));
        console.log('Variants set for model', modelId, ':', data.data.bikes);
      } else {
        console.error('Failed to fetch variants:', data);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const handleBrandSelect = async (slotIndex: number, brand: Brand) => {
    const newSlots = [...bikeSlots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      selectedBrand: brand.name,
      selectedModel: '',
      selectedVariant: '',
      variant: null,
      showBrandDropdown: false,
      showModelDropdown: false,
      showVariantDropdown: false
    };
    setBikeSlots(newSlots);

    // Fetch models for this brand
    await fetchModels(brand.id);
  };

  const handleModelSelect = async (slotIndex: number, model: Model) => {
    console.log('Model selected:', model);
    const newSlots = [...bikeSlots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      selectedModel: model.name,
      selectedVariant: '',
      variant: null,
      showModelDropdown: false,
      showVariantDropdown: false
    };
    setBikeSlots(newSlots);

    // Fetch variants for this model
    await fetchVariants(model.id);
  };

  const handleVariantSelect = async (slotIndex: number, variant: Variant) => {
    // Fetch the complete variant data from comparison API
    const fullVariantData = await compareVariants([variant.id]);
    
    if (fullVariantData && fullVariantData.length > 0) {
      const newSlots = [...bikeSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        selectedVariant: variant.name,
        variant: fullVariantData[0],
        showVariantDropdown: false
      };
      setBikeSlots(newSlots);
    }
  };

  const removeBike = (slotIndex: number) => {
    const newSlots = [...bikeSlots];
    newSlots[slotIndex] = {
      variant: null,
      selectedBrand: '',
      selectedModel: '',
      selectedVariant: '',
      showBrandDropdown: false,
      showModelDropdown: false,
      showVariantDropdown: false
    };
    setBikeSlots(newSlots);
  };

  const toggleDropdown = (slotIndex: number, dropdownType: 'brand' | 'model' | 'variant') => {
    const newSlots = [...bikeSlots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      showBrandDropdown: dropdownType === 'brand' ? !newSlots[slotIndex].showBrandDropdown : false,
      showModelDropdown: dropdownType === 'model' ? !newSlots[slotIndex].showModelDropdown : false,
      showVariantDropdown: dropdownType === 'variant' ? !newSlots[slotIndex].showVariantDropdown : false
    };
    setBikeSlots(newSlots);
  };

  const saveComparison = async () => {
    if (!user || selectedVariants.length < 2) return;

    setSaveLoading(true);
    setSaveError(null);

    try {
      const variantIds = selectedVariants.map(variant => variant.variant_id);

      const response = await fetch('/api/comparisons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantIds,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveSuccess(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to save comparison');
      }
    } catch (error) {
      console.error('Error saving comparison:', error);
      setSaveError('Network error. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const selectedVariants = bikeSlots.filter(slot => slot.variant !== null).map(slot => slot.variant!);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compare Bikes</h1>
              <p className="text-gray-600 mt-2">Select up to {maxComparisons} bikes to compare their specifications</p>
            </div>
          </div>
        </div>

        {/* Fixed 4-Slot Bike Selection Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {bikeSlots.map((slot, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 relative">
              {slot.variant ? (
                // Selected Bike Display
                <div className="text-center">
                  <button
                    onClick={() => removeBike(index)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                  
                  <div className="mb-4">
                    <Image
                      src={slot.variant.image_url}
                      alt={slot.variant.variant_name}
                      width={200}
                      height={150}
                      className="mx-auto rounded-lg"
                    />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {slot.variant.variant_name}
                  </h3>
                  <p className="text-gray-600 mb-2">{slot.variant.brand_name}</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{slot.variant.on_road_price.toLocaleString()}
                  </p>
                </div>
              ) : (
                // Add Bike Interface
                <div className="text-center">
                  {/* Add Bike Circle */}
                  <div className="w-20 h-20 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <FiPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-6">Add bike</p>

                  {/* Brand Selection Dropdown */}
                  <div className="relative mb-4">
                    <button
                      onClick={() => toggleDropdown(index, 'brand')}
                      className="w-full px-4 py-3 text-left bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                    >
                      <span className={slot.selectedBrand ? 'text-gray-900' : 'text-gray-500'}>
                        {slot.selectedBrand || 'Select Brand/Model'}
                      </span>
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {slot.showBrandDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <p className="text-sm font-semibold text-gray-500 mb-2 px-2">POPULAR BRANDS</p>
                          {brands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => handleBrandSelect(index, brand)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                            >
                              {brand.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Model Selection Dropdown */}
                  <div className="relative mb-4">
                    <button
                      onClick={() => {
                        if (slot.selectedBrand) {
                          const selectedBrand = brands.find(b => b.name === slot.selectedBrand);
                          if (selectedBrand && !models[selectedBrand.id]) {
                            fetchModels(selectedBrand.id);
                          }
                          toggleDropdown(index, 'model');
                        }
                      }}
                      disabled={!slot.selectedBrand}
                      className={`w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
                        !slot.selectedBrand ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                      }`}
                    >
                      <span className={slot.selectedModel ? 'text-gray-900' : 'text-gray-400'}>
                        {slot.selectedModel || 'Select Model'}
                      </span>
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {slot.showModelDropdown && slot.selectedBrand && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {(() => {
                            const selectedBrand = brands.find(b => b.name === slot.selectedBrand);
                            const brandModels = selectedBrand ? models[selectedBrand.id] : [];
                            return brandModels?.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => handleModelSelect(index, model)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                              >
                                {model.name}
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Variant Selection Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (slot.selectedModel) {
                          const selectedBrand = brands.find(b => b.name === slot.selectedBrand);
                          const selectedModel = selectedBrand ? models[selectedBrand.id]?.find(m => m.name === slot.selectedModel) : null;
                          if (selectedModel && !variants[selectedModel.id]) {
                            fetchVariants(selectedModel.id);
                          }
                          toggleDropdown(index, 'variant');
                        }
                      }}
                      disabled={!slot.selectedModel}
                      className={`w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
                        !slot.selectedModel ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                      }`}
                    >
                      <span className={slot.selectedVariant ? 'text-gray-900' : 'text-gray-400'}>
                        {slot.selectedVariant || 'Select Variant'}
                      </span>
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {slot.showVariantDropdown && slot.selectedModel && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {(() => {
                            const selectedBrand = brands.find(b => b.name === slot.selectedBrand);
                            const selectedModel = selectedBrand ? models[selectedBrand.id]?.find(m => m.name === slot.selectedModel) : null;
                            const modelVariants = selectedModel ? variants[selectedModel.id] : [];
                            return modelVariants?.map((variant) => (
                              <button
                                key={variant.id}
                                onClick={() => handleVariantSelect(index, variant)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                              >
                                {variant.name}
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Comparison Table */}
        {selectedVariants.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Detailed Comparison</h2>
              
              {/* Save Comparison Section */}
              {user && selectedVariants.length >= 2 && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={saveComparison}
                    disabled={saveLoading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saveLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <FiBookmark className="w-4 h-4 mr-2" />
                    )}
                    {saveLoading ? 'Saving...' : 'Save Comparison'}
                  </button>
                </div>
              )}
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="px-6 py-3 bg-green-50 border-b border-green-200">
                <div className="flex items-center text-green-800">
                  <FiCheck className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Comparison saved successfully!</span>
                </div>
              </div>
            )}

            {saveError && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                <div className="flex items-center text-red-800">
                  <FiX className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">{saveError}</span>
                </div>
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!user && !authLoading && selectedVariants.length >= 2 && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between text-blue-800">
                  <span className="text-sm font-medium">Want to save this comparison for later?</span>
                  <Link 
                    href="/login"
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Login to Save
                  </Link>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Specifications
                    </th>
                    {selectedVariants.map((variant, index) => (
                      <th key={index} className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                        <div className="flex flex-col items-center">
                          <Image
                            src={variant.image_url}
                            alt={variant.variant_name}
                            width={80}
                            height={60}
                            className="rounded mb-2"
                          />
                          <span className="font-semibold text-gray-900 break-words">{variant.variant_name}</span>
                          <span className="text-gray-600 text-xs">{variant.brand_name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { label: 'Price', key: 'on_road_price', format: (value: any) => `₹${Number(value).toLocaleString()}` },
                    { label: 'Displacement', key: 'displacement' },
                    { label: 'Power', key: 'peak_power' },
                    { label: 'Mileage', key: 'city_mileage' },
                    { 
                      label: 'Engine Type', 
                      key: 'engine_type',
                      format: (value: any) => {
                        if (!value || value === 'N/A') return 'N/A';
                        // Add proper spacing after commas and capitalize first letter
                        return String(value)
                          .split(',')
                          .map(part => part.trim())
                          .join(', ')
                          .replace(/^\w/, c => c.toUpperCase());
                      }
                    },
                    { label: 'Body Type', key: 'body_type' },
                    { label: 'Average Rating', key: 'averageRating', format: (value: any) => value ? `${value} ⭐` : 'No ratings' },
                    { label: 'Reviews', key: 'reviewCount', format: (value: any) => `${value} reviews` }
                  ].map((spec, specIndex) => (
                    <tr key={specIndex} className={specIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {spec.label}
                      </td>
                      {selectedVariants.map((variant, bikeIndex) => (
                        <td key={bikeIndex} className={`px-6 py-4 text-sm text-gray-700 text-center ${
                          spec.key === 'engine_type' 
                            ? 'whitespace-normal break-words max-w-xs' 
                            : 'whitespace-nowrap'
                        }`}>
                          <div className={spec.key === 'engine_type' ? 'leading-relaxed' : ''}>
                            {spec.format 
                              ? spec.format(variant[spec.key as keyof ComparisonVariant]) 
                              : String(variant[spec.key as keyof ComparisonVariant] || 'N/A')
                            }
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedVariants.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bikes selected</h3>
            <p className="text-gray-500">Select bikes from the slots above to see detailed comparison</p>
          </div>
        )}

        {/* Loading and Error States */}
        {compareLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading comparison data...</p>
          </div>
        )}

        {compareError && (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {compareError}</p>
          </div>
        )}
      </div>
    </div>
  );
}