'use client';

import { useState } from 'react';
import { FiX, FiMail, FiUser, FiCheckCircle } from 'react-icons/fi';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bikeData: {
    id: string;
    name: string;
    expectedPrice?: string;
    expectedLaunch?: string;
    image?: string;
  };
}

interface FormData {
  name: string;
  email: string;
}

export default function NotificationPopup({ isOpen, onClose, bikeData }: NotificationPopupProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string } = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/bike-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          bikeData: {
            id: bikeData.id,
            name: bikeData.name,
            expectedPrice: bikeData.expectedPrice,
            expectedLaunch: bikeData.expectedLaunch,
            image: bikeData.image
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Reset form after a delay
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({ name: '', email: '' });
          onClose();
        }, 2000);
      } else {
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', email: '' });
      setErrorMessage('');
      setFormErrors({});
      setIsSuccess(false);
      onClose();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Get Notified When Launched
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Bike Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{bikeData.name}</h3>
              {bikeData.expectedPrice && (
                <p className="text-sm text-gray-600">Expected Price: ₹ {bikeData.expectedPrice}</p>
              )}
              {bikeData.expectedLaunch && (
                <p className="text-sm text-gray-600">Expected Launch: {bikeData.expectedLaunch}</p>
              )}
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-2" size={20} />
                  <p className="text-green-700">
                    Thanks! We'll notify you when {bikeData.name} launches.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Form */}
            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className={`${formErrors.name ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.name
                          ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:border-primary'
                      }`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className={`${formErrors.email ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.email
                          ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:border-primary'
                      }`}
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-4 py-2 text-white rounded-md font-medium transition-colors ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-600'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Notify Me When Launched'}
                </button>
              </form>
            )}

            {/* Info Text */}
            <p className="mt-4 text-xs text-gray-500 text-center">
              We'll send you an email with complete bike details when it's launched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}