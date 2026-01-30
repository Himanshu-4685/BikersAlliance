'use client';

import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiPhone, FiMail, FiLoader } from 'react-icons/fi';

interface Dealer {
  dealer_id: number;
  name: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

interface DealerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealerSelect: (dealer: Dealer) => void;
  bikeName: string;
}

export default function DealerSelectionModal({ 
  isOpen, 
  onClose, 
  onDealerSelect, 
  bikeName 
}: DealerSelectionModalProps) {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available states when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStates();
    }
  }, [isOpen]);

  // Fetch dealers when state changes
  useEffect(() => {
    if (selectedState) {
      fetchDealers(selectedState);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    setLoadingStates(true);
    setError(null);
    try {
      const response = await fetch('/api/dealers/states');
      const result = await response.json();
      
      if (result.success) {
        setStates(result.data);
      } else {
        setError('Failed to load states');
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setError('Failed to load states');
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchDealers = async (state: string) => {
    setLoadingDealers(true);
    setError(null);
    try {
      const response = await fetch(`/api/dealers?state=${encodeURIComponent(state)}&limit=50`);
      const result = await response.json();
      
      if (result.success) {
        setDealers(result.data.dealers);
      } else {
        setError('Failed to load dealers');
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
      setError('Failed to load dealers');
    } finally {
      setLoadingDealers(false);
    }
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDealer(null);
    setDealers([]);
  };

  const handleDealerSelect = (dealer: Dealer) => {
    setSelectedDealer(dealer);
  };

  const handleConfirm = () => {
    if (selectedDealer) {
      onDealerSelect(selectedDealer);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedState('');
    setSelectedDealer(null);
    setDealers([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select a Dealer</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a dealer near you for <span className="font-medium">{bikeName}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* State Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your State
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              disabled={loadingStates}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            >
              <option value="">
                {loadingStates ? 'Loading states...' : 'Choose a state'}
              </option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Dealers List */}
          {selectedState && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Dealers in {selectedState}
              </label>
              
              {loadingDealers ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-6 h-6 animate-spin text-primary mr-2" />
                  <span className="text-gray-600">Loading dealers...</span>
                </div>
              ) : dealers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No dealers available in {selectedState}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {dealers.map((dealer) => (
                    <div
                      key={dealer.dealer_id}
                      onClick={() => handleDealerSelect(dealer)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDealer?.dealer_id === dealer.dealer_id
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{dealer.name}</h3>
                          {dealer.address && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <FiMapPin className="w-4 h-4 mr-1" />
                              {dealer.address}, {dealer.city}
                              {dealer.pincode && ` - ${dealer.pincode}`}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            {dealer.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FiPhone className="w-4 h-4 mr-1" />
                                {dealer.phone}
                              </div>
                            )}
                            {dealer.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FiMail className="w-4 h-4 mr-1" />
                                {dealer.email}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedDealer?.dealer_id === dealer.dealer_id && (
                          <div className="ml-3 flex-shrink-0">
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDealer}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Dealer
          </button>
        </div>
      </div>
    </div>
  );
}