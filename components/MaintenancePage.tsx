import Link from 'next/link';
import { FiTool, FiArrowLeft, FiHome } from 'react-icons/fi';

interface MaintenancePageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backUrl?: string;
  backText?: string;
}

export default function MaintenancePage({
  title = "Under Maintenance",
  message = "This section is currently undergoing maintenance. Please check back soon for updates.",
  showBackButton = true,
  backUrl = "/",
  backText = "Go to Homepage"
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Maintenance Icon */}
        <div className="mx-auto flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-8">
          <FiTool className="w-12 h-12 text-orange-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showBackButton && (
            <Link
              href={backUrl}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              {backText}
            </Link>
          )}
          
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiHome className="w-4 h-4 mr-2" />
            Homepage
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            If you continue to experience issues, please{' '}
            <Link href="/contact" className="text-red-600 hover:text-red-700 font-medium">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}