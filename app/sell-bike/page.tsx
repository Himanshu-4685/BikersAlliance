'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUpload, FiCamera, FiCheck, FiInfo, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';
import SuccessPopup from '@/components/common/SuccessPopup';

const bikeCategories = [
  'Motorcycle', 'Scooter', 'Sports Bike', 'Cruiser', 'Touring', 'Adventure', 'Electric'
];

const fuelTypes = [
  'Petrol', 'Electric', 'CNG', 'Diesel'
];

const transmissionTypes = [
  'Manual', 'Automatic', 'CVT'
];

const ownershipTypes = [
  'First Owner', 'Second Owner', 'Third Owner', 'Fourth Owner or More'
];

export default function SellBikePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/sell-bike');
    }
  }, [user, isLoading, router]);
  
  const [formData, setFormData] = useState({
    // Bike Details
    brand: '',
    model: '',
    variant: '',
    year: '',
    category: '',
    fuelType: '',
    transmission: '',
    kmDriven: '',
    ownership: '',
    
    // Pricing
    expectedPrice: '',
    
    // Condition
    condition: '',
    description: '',
    
    // Contact Details
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    
    // Documents
    hasRC: false,
    hasInsurance: false,
    hasPUC: false,
    
    // Photos
    photos: [] as string[]
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  // State for success popup and form submission
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (uploadedImages.length + files.length > 10) {
      alert('You can upload maximum 10 photos');
      return;
    }

    setIsUploading(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/sell-bike-images', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const newImages = result.data.map((item: any) => ({
          url: item.url,
          path: item.path,
          fileName: item.fileName
        }));
        
        setUploadedImages(prev => [...prev, ...newImages]);
        setFormData(prev => ({ 
          ...prev, 
          photos: [...prev.photos, ...newImages.map((img: any) => img.url)] 
        }));
      } else {
        setSubmitError(result.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSubmitError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    
    try {
      // Delete from storage
      await fetch(`/api/upload/sell-bike-images?path=${encodeURIComponent(imageToRemove.path)}`, {
        method: 'DELETE'
      });

      // Remove from state
      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      setFormData(prev => ({
        ...prev,
        photos: newImages.map(img => img.url)
      }));
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/sell-bike', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setShowSuccessPopup(true);
        // Reset form
        setFormData({
          brand: '',
          model: '',
          variant: '',
          year: '',
          category: '',
          fuelType: '',
          transmission: '',
          kmDriven: '',
          ownership: '',
          expectedPrice: '',
          condition: '',
          description: '',
          ownerName: '',
          email: '',
          phone: '',
          city: '',
          state: '',
          hasRC: false,
          hasInsurance: false,
          hasPUC: false,
          photos: [] as string[]
        });
        setUploadedImages([]);
        setCurrentStep(1);
      } else {
        setSubmitError(result.error || 'Failed to submit listing');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Failed to submit listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      const requiredStep1Fields = ['brand', 'model', 'year', 'category', 'fuelType', 'transmission', 'kmDriven'];
      const missingFields = requiredStep1Fields.filter(field => !formData[field as keyof typeof formData]);
      if (missingFields.length > 0) {
        setSubmitError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }
    } else if (currentStep === 2) {
      const requiredStep2Fields = ['ownership', 'expectedPrice', 'condition'];
      const missingFields = requiredStep2Fields.filter(field => !formData[field as keyof typeof formData]);
      if (missingFields.length > 0) {
        setSubmitError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }
    } else if (currentStep === 3) {
      const requiredStep3Fields = ['ownerName', 'email', 'phone', 'city', 'state'];
      const missingFields = requiredStep3Fields.filter(field => !formData[field as keyof typeof formData]);
      if (missingFields.length > 0) {
        setSubmitError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    // Clear error and proceed
    setSubmitError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? <FiCheck className="w-4 h-4" /> : step}
            </div>
            {step < 4 && (
              <div className={`w-20 h-1 mx-2 ${
                step < currentStep ? 'bg-red-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Bike Details</span>
        <span>Condition & Price</span>
        <span>Contact Info</span>
        <span>Photos & Submit</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Bike Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand *
          </label>
          <input
            key="brand-input"
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="e.g., Honda, Hero, TVS, Bajaj, Royal Enfield"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model *
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="e.g., Activa 6G"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variant
          </label>
          <input
            type="text"
            name="variant"
            value={formData.variant}
            onChange={handleInputChange}
            placeholder="e.g., Standard, Deluxe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturing Year *
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Year</option>
            {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Category</option>
            {bikeCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type *
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Fuel Type</option>
            {fuelTypes.map(fuel => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transmission *
          </label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Transmission</option>
            {transmissionTypes.map(trans => (
              <option key={trans} value={trans}>{trans}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            KM Driven *
          </label>
          <input
            type="number"
            name="kmDriven"
            value={formData.kmDriven}
            onChange={handleInputChange}
            placeholder="e.g., 15000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Condition & Pricing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ownership *
          </label>
          <select
            name="ownership"
            value={formData.ownership}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Ownership</option>
            {ownershipTypes.map(owner => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Price (₹) *
          </label>
          <input
            type="number"
            name="expectedPrice"
            value={formData.expectedPrice}
            onChange={handleInputChange}
            placeholder="e.g., 65000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Condition *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Excellent', 'Good', 'Fair'].map((cond) => (
            <label key={cond} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="condition"
                value={cond}
                checked={formData.condition === cond}
                onChange={handleInputChange}
                className="mr-3 text-red-500 focus:ring-red-500"
              />
              <div>
                <div className="font-medium">{cond}</div>
                <div className="text-sm text-gray-600">
                  {cond === 'Excellent' && 'Like new, minimal wear'}
                  {cond === 'Good' && 'Well maintained, some wear'}
                  {cond === 'Fair' && 'Functional, visible wear'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Describe any modifications, issues, or additional details about your bike..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div>
        <h4 className="font-medium mb-3">Available Documents</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasRC"
              checked={formData.hasRC}
              onChange={handleInputChange}
              className="mr-3 text-red-500 focus:ring-red-500"
            />
            Registration Certificate (RC)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasInsurance"
              checked={formData.hasInsurance}
              onChange={handleInputChange}
              className="mr-3 text-red-500 focus:ring-red-500"
            />
            Valid Insurance
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasPUC"
              checked={formData.hasPUC}
              onChange={handleInputChange}
              className="mr-3 text-red-500 focus:ring-red-500"
            />
            Pollution Under Control (PUC) Certificate
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner Name *
          </label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
            placeholder="Your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+91 9876543210"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="e.g., Mumbai"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select State</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Delhi">Delhi</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Upload Photos</h3>
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <FiCamera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Bike Photos</h4>
        <p className="text-gray-600 mb-4">
          Add up to 10 photos of your bike. Include front, side, rear views and any damages.
        </p>
        <label className={`inline-flex items-center px-6 py-3 rounded-lg cursor-pointer transition-colors ${
          isUploading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-500 hover:bg-red-600'
        } text-white`}>
          {isUploading ? (
            <>
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FiUpload className="w-4 h-4 mr-2" />
              Choose Photos
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={isUploading || uploadedImages.length >= 10}
            className="hidden"
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">
          {uploadedImages.length}/10 photos uploaded
        </p>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Photos ({uploadedImages.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.url}
                    alt={`Bike photo ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiInfo className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p>{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message is now handled by popup */}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FiInfo className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h5 className="font-medium mb-1">Important Information</h5>
            <ul className="space-y-1 text-blue-700">
              <li>• Upload clear, well-lit photos for better response</li>
              <li>• Include photos of any damages or modifications</li>
              <li>• Photos of documents (RC, Insurance) can help build trust</li>
              <li>• We recommend uploading at least 5 photos</li>
              <li>• Maximum file size: 5MB per image</li>
              <li>• Supported formats: JPEG, PNG, WebP, AVIF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-red-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sell your bike in a click!
            </h1>
            <p className="text-xl text-red-100">
              Get the best price for your bike with our hassle-free selling process
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              {renderProgressBar()}
              
              <form onSubmit={handleSubmit} noValidate>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        prevStep();
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  
                  <div className="ml-auto">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextStep();
                        }}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={(e) => {
                          if (isSubmitting) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          'Submit Listing'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">Important Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Free Listing</h3>
                <p className="text-gray-600 text-sm">
                  List your bike for free and reach thousands of potential buyers
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Quick Sale</h3>
                <p className="text-gray-600 text-sm">
                  Get genuine inquiries and sell your bike faster than traditional methods
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Best Price</h3>
                <p className="text-gray-600 text-sm">
                  Get the best market price for your bike with our pricing guidance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Success Popup */}
    <SuccessPopup
      isOpen={showSuccessPopup}
      onClose={() => setShowSuccessPopup(false)}
      title="Submission Successful!"
      message="Your bike listing has been submitted successfully and is now under review."
      subMessage="We'll email you once the listing is approved and goes live on our platform. This usually takes 24-48 hours."
    />
    </>
  );
}