import { Metadata } from 'next';
import MaintenancePage from '@/components/MaintenancePage';
import Link from 'next/link';
import { FiVideo, FiArrowRight } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Videos Under Maintenance - BikersAlliance',
  description: 'Our video section is currently under maintenance. Please check back soon for the latest bike videos.',
};

export default function VideoMaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Video Maintenance Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Video Icon */}
          <div className="mx-auto flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-8">
            <FiVideo className="w-12 h-12 text-orange-600" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Videos Under Maintenance
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Our video section is currently undergoing maintenance to bring you better content 
            and improved viewing experience. We're working hard to get it back online soon!
          </p>

          {/* Features Coming Soon */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12 text-left max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Coming Soon</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                <span>High-quality bike reviews and test rides</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                <span>Expert comparisons between bike models</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                <span>First ride experiences and road tests</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                <span>Maintenance tips and riding guides</span>
              </li>
            </ul>
          </div>

          {/* Alternative Content */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/news"
              className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Latest News</h3>
                <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </div>
              <p className="text-gray-600">
                Stay updated with the latest motorcycle news, launches, and industry updates.
              </p>
            </Link>

            <Link
              href="/bikes"
              className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Browse Bikes</h3>
                <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </div>
              <p className="text-gray-600">
                Explore our extensive database of motorcycles with detailed specifications.
              </p>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Homepage
            </Link>
            
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Footer Message */}
          <div className="mt-16 p-6 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              We apologize for any inconvenience. Our team is working around the clock to restore the video section. 
              Thank you for your patience!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}