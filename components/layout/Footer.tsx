'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscriptionStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscriptionStatus({
          type: 'success',
          message: data.message || 'Successfully subscribed! Check your email for a welcome message.'
        });
        setEmail('');
      } else {
        setSubscriptionStatus({
          type: 'error',
          message: data.error || 'Failed to subscribe. Please try again.'
        });
      }
    } catch (error) {
      setSubscriptionStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const handleSocialMediaClick = () => {
    setShowComingSoon(true);
  };
  
  return (
    <footer className="bg-secondary-500 text-white">
      {/* Main Footer */}
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <Link href="/" className="inline-block mb-4">
             <Image 
                             src="/logo.png" 
                             alt="BikersAlliance" 
                             width={180} 
                             height={40} 
                             className="w-auto h-8 md:h-10"
                             priority
                             onError={(e) => {
                               // Fallback to text if image fails to load
                               e.currentTarget.src = "/logo-fallback.svg";
                             }}
                             />
            </Link>
            <p className="mb-4 text-sm text-gray-300">
              BikersAlliance is India's premier motorcycle marketplace, offering
              comprehensive information on bikes, comparisons, reviews and more.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={handleSocialMediaClick}
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Facebook - Coming Soon"
              >
                <FiFacebook />
              </button>
              <button 
                onClick={handleSocialMediaClick}
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Twitter - Coming Soon"
              >
                <FiTwitter />
              </button>
              <button 
                onClick={handleSocialMediaClick}
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Instagram - Coming Soon"
              >
                <FiInstagram />
              </button>
              <button 
                onClick={handleSocialMediaClick}
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="YouTube - Coming Soon"
              >
                <FiYoutube />
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/bikes/all" className="text-sm text-gray-300 hover:text-white">
                  New Bikes
                </Link>
              </li>
              <li>
                <Link href="/used-bikes" className="text-sm text-gray-300 hover:text-white">
                  Used Bikes
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-sm text-gray-300 hover:text-white">
                  Compare Bikes
                </Link>
              </li>
              <li>
                <Link href="/showrooms" className="text-sm text-gray-300 hover:text-white">
                  Showrooms
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-gray-300 hover:text-white">
                  Bike News
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="text-sm text-gray-300 hover:text-white">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Brands */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Popular Brands</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/brands/honda" className="text-sm text-gray-300 hover:text-white">
                Honda
              </Link>
              <Link href="/brands/hero" className="text-sm text-gray-300 hover:text-white">
                Hero
              </Link>
              <Link href="/brands/bajaj" className="text-sm text-gray-300 hover:text-white">
                Bajaj
              </Link>
              <Link href="/brands/tvs" className="text-sm text-gray-300 hover:text-white">
                TVS
              </Link>
              <Link href="/brands/yamaha" className="text-sm text-gray-300 hover:text-white">
                Yamaha
              </Link>
              <Link href="/brands/royal-enfield" className="text-sm text-gray-300 hover:text-white">
                Royal Enfield
              </Link>
              <Link href="/brands/suzuki" className="text-sm text-gray-300 hover:text-white">
                Suzuki
              </Link>
              <Link href="/brands/ktm" className="text-sm text-gray-300 hover:text-white">
                KTM
              </Link>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Newsletter</h3>
            <p className="mb-4 text-sm text-gray-300">
              Subscribe to our newsletter for the latest updates on new bikes,
              reviews and automotive news.
            </p>
            
            {/* Status Messages */}
            {subscriptionStatus.type && (
              <div className={`mb-3 p-2 rounded text-sm ${
                subscriptionStatus.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {subscriptionStatus.message}
              </div>
            )}
            
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="px-3 py-2 text-sm text-gray-900 bg-white border-none rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className={`px-3 py-2 text-sm font-medium text-white transition-colors rounded-md ${
                  isSubscribing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-600'
                }`}
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="py-4 border-t border-gray-700 bg-secondary-600">
        <div className="container">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 text-sm text-gray-300 md:mb-0">
              &copy; {new Date().getFullYear()} BikersAlliance. All Rights Reserved.
            </div>
            <div className="flex flex-wrap space-x-4 text-sm">
              <Link href="/privacy-policy" className="text-gray-300 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-conditions" className="text-gray-300 hover:text-white">
                Terms & Conditions
              </Link>
              <Link href="/sitemap" className="text-gray-300 hover:text-white">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Coming Soon Popup */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon!</h3>
              <p className="text-gray-600 mb-4">
                We're working on connecting our social media accounts. Stay tuned for updates!
              </p>
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}