'use client';

import React from 'react';
import { FiTool, FiClock, FiArrowLeft } from 'react-icons/fi';

interface MaintenanceModalProps {
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function MaintenanceModal({ 
  onClose, 
  title = "Under Maintenance",
  message = "We're currently working on improving this feature. Please check back soon!"
}: MaintenanceModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        {/* Maintenance Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTool className="w-10 h-10 text-orange-500" />
          </div>
          <div className="flex items-center justify-center text-orange-500 mb-2">
            <FiClock className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Temporarily Unavailable</span>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {title}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Additional Info */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <p className="text-orange-800 text-sm">
            <strong>Expected Resolution:</strong> We're working to restore this service as quickly as possible. 
            Thank you for your patience!
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>

        {/* Contact Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Need immediate assistance? Contact us at{' '}
            <a href="mailto:support@bikersalliance.com" className="text-primary hover:underline">
              support@bikersalliance.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}