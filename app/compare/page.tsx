'use client';

import { useState, useEffect } from 'react';
import { useComparison } from '@/context/ComparisonContext';
import { useCompare, ComparisonVariant } from '@/hooks/useCompare';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiPlus, FiArrowLeft, FiChevronDown } from 'react-icons/fi';

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
  const { comparisonList, clearComparison, maxComparisons, setMaxComparisons } = useComparison();
  const { compareVariants, loading: compareLoading, error: compareError } = useCompare();
  
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
          const newSlots = [...bikeSlots];
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
    };

    initializeFromContext();
  }, [comparisonList]);

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
            
            {/* Dynamic comparison count selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="maxComparisons" className="text-sm font-medium text-gray-700">
                Compare up to:
              </label>
              <select
                id="maxComparisons"
                value={maxComparisons}
                onChange={(e) => setMaxComparisons(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={2}>2 bikes</option>
                <option value={3}>3 bikes</option>
                <option value={4}>4 bikes</option>
                <option value={5}>5 bikes</option>
                <option value={6}>6 bikes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Bike Selection Slots */}
        <div className={`grid gap-6 mb-8 ${
          maxComparisons === 2 ? 'md:grid-cols-2' :
          maxComparisons === 3 ? 'md:grid-cols-3' :
          maxComparisons === 4 ? 'md:grid-cols-4' :
          maxComparisons === 5 ? 'md:grid-cols-5' :
          'md:grid-cols-6'
        }`}>
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
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detailed Comparison</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Specifications
                    </th>
                    {selectedVariants.map((variant, index) => (
                      <th key={index} className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex flex-col items-center">
                          <Image
                            src={variant.image_url}
                            alt={variant.variant_name}
                            width={80}
                            height={60}
                            className="rounded mb-2"
                          />
                          <span className="font-semibold text-gray-900">{variant.variant_name}</span>
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
                    { label: 'Engine Type', key: 'engine_type' },
                    { label: 'Body Type', key: 'body_type' },
                    { label: 'Average Rating', key: 'averageRating', format: (value: any) => value ? `${value} ⭐` : 'No ratings' },
                    { label: 'Reviews', key: 'reviewCount', format: (value: any) => `${value} reviews` }
                  ].map((spec, specIndex) => (
                    <tr key={specIndex} className={specIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {spec.label}
                      </td>
                      {selectedVariants.map((variant, bikeIndex) => (
                        <td key={bikeIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                          {spec.format 
                            ? spec.format(variant[spec.key as keyof ComparisonVariant]) 
                            : String(variant[spec.key as keyof ComparisonVariant] || 'N/A')
                          }
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