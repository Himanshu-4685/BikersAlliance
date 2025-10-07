'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription functionality
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
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
                src="/logo.svg" 
                alt="BikersAlliance" 
                width={180} 
                height={40} 
                className="w-auto h-10 brightness-0 invert"
              />
            </Link>
            <p className="mb-4 text-sm text-gray-300">
              BikersAlliance is India's premier motorcycle marketplace, offering
              comprehensive information on bikes, comparisons, reviews and more.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FiFacebook />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FiTwitter />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FiInstagram />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FiYoutube />
              </a>
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
                <Link href="/bikes" className="text-sm text-gray-300 hover:text-white">
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
                <Link href="/dealers" className="text-sm text-gray-300 hover:text-white">
                  Dealer Locator
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-gray-300 hover:text-white">
                  Bike News
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
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="px-3 py-2 text-sm text-gray-900 bg-white border-none rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="px-3 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-md hover:bg-primary-600"
              >
                Subscribe
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
    </footer>
  );
}