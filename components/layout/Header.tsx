'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiMenu, FiX, FiUser, FiHeart, FiSearch, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';
import { useWishlist } from '@/context/WishlistContext';
import UserProfile from '@/components/auth/UserProfile';
import SearchSuggestions from '@/components/common/SearchSuggestions';
import SearchBar from '@/components/common/SearchBar';
import { SearchSuggestion } from '@/utils/api/search';

// Navigation items with dropdowns
const navItems = [
  { 
    label: 'BIKES', 
    href: '/bikes/all',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Best Bikes', href: '/bikes/best', hasSubDropdown: true, 
        subItems: [
          { label: 'Royal Enfield Hunter 350', href: '/bikes/386' },
          { label: 'Royal Enfield Continental GT 650', href: '/bikes/413' },
          { label: 'Royal Enfield Classic 350', href: '/bikes/420' },
          { label: 'Hero Splendor Plus', href: '/bikes/182' },
          { label: 'TVS Raider', href: '/bikes/484' },
          { label: 'All Best Bikes', href: '/bikes/best' },
        ]
      },
      { label: 'Upcoming Bikes', href: '/upcoming-bikes' },
      { label: 'New Bike Launches', href: '/latest-bikes' },
      { label: 'Compare Bikes', href: '/compare' },
      { label: 'Popular Brands', href: '/brands', hasSubDropdown: true,
        subItems: [
          { label: 'Honda Bikes', href: '/brands/honda' },
          { label: 'Royal Enfield Bikes', href: '/brands/royal-enfield' },
          { label: 'TVS Bikes', href: '/brands/tvs' },
          { label: 'Yamaha Bikes', href: '/brands/yamaha' },
          { label: 'Hero Bikes', href: '/brands/hero' },
        ]
      },
      { label: 'Bike Offers', href: '/bikes/offers' },
      { label: 'Showrooms', href: '/showrooms' },
      { label: 'Fuel Calculator', href: '/tools/fuel-calculator' },
    ]
  },
  { 
    label: 'SCOOTERS', 
    href: '/scooters',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Best Scooters', href: '/scooters/best', hasSubDropdown: true,
        subItems: [
          { label: 'Honda Activa 6G', href: '/bikes/230' },
          { label: 'Suzuki Access 125', href: '/bikes/421' },
          { label: 'TVS Jupiter', href: '/bikes/538' },
          { label: 'TVS iQube', href: '/bikes/528' },
          { label: 'All Best Scooters', href: '/bikes/best' },
        ]
      },
      { label: 'Upcoming Scooters', href: '/upcoming-bikes' },
      { label: 'New Scooter Launches', href: '/latest-bikes' },
    ]
  },
  { 
    label: 'ELECTRIC ZONE', 
    href: '/electric',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Electric Bike Charging Stations', href: '/electric/charging-stations' },
    ]
  },
  { 
    label: 'BIKE FINANCE', 
    href: '/finance',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Finance Discount Offers', href: '/finance/offers' },
      { label: 'EMI Calculator', href: '/finance/emi-calculator' },
      { label: 'Loan Eligibility', href: '/finance/eligibility' },
    ]
  },
  { 
    label: 'USED BIKES', 
    href: '/used-bikes',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Sell Bike', href: '/sell-bike' },
    ]
  },
  { 
    label: 'NEWS & VIDEOS', 
    href: '/news',
    hasDropdown: true,
    dropdownItems: [
      { label: 'News', href: '/news' },
      { label: 'Videos', href: '/videos' },
      { label: 'Web Stories', href: '/web-stories' },
    ]
  },
];

export default function Header() {
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [openSubDropdowns, setOpenSubDropdowns] = useState<Record<string, number | null>>({});
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<{parent: number, child: number} | null>(null);
  const pathname = usePathname();
  
  const handleDropdownToggle = (index: number) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSubDropdownToggle = (parentIndex: number, childIndex: number | null) => {
    setOpenSubDropdowns(prev => ({
      ...prev,
      [parentIndex]: prev[parentIndex] === childIndex ? null : childIndex
    }));
  };
  
  // Use refs to store timeouts
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleDropdownHover = (index: number | null) => {
    // Clear any existing timeout
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    
    if (index === null) {
      // Add slight delay before closing to allow moving to sub-dropdown
      dropdownTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 200);
    } else {
      setActiveDropdown(index);
    }
  };
  
  const handleSubDropdownHover = (parentIndex: number, childIndex: number) => {
    // Clear any existing timeout
    if (subDropdownTimeoutRef.current) {
      clearTimeout(subDropdownTimeoutRef.current);
      subDropdownTimeoutRef.current = null;
    }
    
    setActiveSubDropdown({ parent: parentIndex, child: childIndex });
  };
  
  const handleSubDropdownLeave = () => {
    // Add slight delay before closing
    subDropdownTimeoutRef.current = setTimeout(() => {
      setActiveSubDropdown(null);
    }, 200);
  };


  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Upper header part - Logo, Search, Login */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center">
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
            
            {/* Search Bar - visible on desktop, hidden on mobile */}
            <div className="hidden md:flex flex-1 mx-8">
              <SearchBar />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3 md:space-x-5">
              {/* City Selector - matches the second image */}
              <div className="hidden md:flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <select className="text-sm border-none bg-transparent focus:outline-none focus:ring-0">
                  <option value="jaipur">Jaipur</option>
                  <option value="delhi">Delhi</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="bangalore">Bangalore</option>
                </select>
              </div>
              
              {/* Mobile Search Button */}
              <button
                className="p-1 text-gray-500 transition-colors hover:text-primary md:hidden"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              
              {/* Language Selector - matches the second image */}
              <div className="hidden md:block">
                <select className="text-sm border-none bg-transparent focus:outline-none focus:ring-0">
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
              
              {/* Removed wishlist and login buttons from here - moving to lower section */}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-1 text-gray-500 md:hidden"
                aria-label="Open main menu"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lower header part - Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center">
              {navItems.map((item, index) => (
                <div 
                  key={item.href} 
                  className="relative"
                  onMouseEnter={() => handleDropdownHover(index)}
                  onMouseLeave={() => handleDropdownHover(null)}
                >
                  <div className="flex items-center cursor-pointer py-3 px-4 first:pl-0 last:pr-0">
                    <Link
                      href={item.href}
                      className={`text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-primary'
                          : 'text-gray-800 hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.hasDropdown && (
                      <FiChevronDown 
                        className={`ml-1 w-4 h-4 text-gray-500 transition-transform ${
                          activeDropdown === index ? 'transform rotate-180 text-primary' : ''
                        }`} 
                      />
                    )}
                  </div>
                
                {/* Dropdown Menu */}
                {item.hasDropdown && item.dropdownItems && (
                  <div 
                    className={`absolute left-0 top-full w-64 bg-white shadow-lg py-1 z-50 border border-gray-100 transition-all duration-200 ${
                      activeDropdown === index ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                  >
                    {item.dropdownItems.map((dropdownItem, dIndex) => (
                      <div 
                        key={`${item.href}-${dIndex}`} 
                        className="relative"
                        onMouseEnter={() => dropdownItem.hasSubDropdown && handleSubDropdownHover(index, dIndex)}
                        onMouseLeave={() => handleSubDropdownLeave()}
                      >
                        <div className="w-full">
                          <Link
                            href={dropdownItem.href}
                            className={`block w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                              dropdownItem.hasSubDropdown ? 'flex justify-between items-center' : ''
                            }`}
                            onMouseEnter={() => dropdownItem.hasSubDropdown && handleSubDropdownHover(index, dIndex)}
                          >
                            <span>{dropdownItem.label}</span>
                            {dropdownItem.hasSubDropdown && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </Link>
                        </div>
                        
                        {/* Sub-dropdown Menu */}
                        {dropdownItem.hasSubDropdown && (
                          <div 
                            className={`absolute left-full top-0 w-64 bg-white shadow-lg py-1 z-50 border border-gray-100 transition-all duration-200 ${
                              activeSubDropdown && activeSubDropdown.parent === index && activeSubDropdown.child === dIndex 
                                ? 'opacity-100 visible' 
                                : 'opacity-0 invisible'
                            }`}
                            style={{ marginLeft: '1px', marginTop: '0px' }}
                          >
                            {dropdownItem.subItems.map((subItem, sIndex) => (
                              <Link
                                key={`${dropdownItem.href}-${sIndex}`}
                                href={subItem.href}
                                className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            </div>
            
            {/* Action Buttons - moved to the right side of navigation */}
            <div className="flex items-center space-x-4">
              {/* Wishlist Icon */}
              <Link
                href={user ? "/dashboard?section=shortlisted" : "/login"}
                className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary transition-colors"
                title={user ? "View wishlist" : "Login to view wishlist"}
              >
                <FiHeart className="w-5 h-5" />
                {user && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {user ? (
                <UserProfile />
              ) : (
                <Link
                  href="/login"
                  className="flex items-center px-5 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
          
          {/* Mobile menu button - outside of nav to preserve correct positioning */}
          <div className="md:hidden flex justify-end py-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-1 text-gray-500"
              aria-label="Open main menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Bar removed as we've added it to the upper header */}
      
      {/* Add CSS for transitions */}
      <style jsx global>{`
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .duration-200 {
          transition-duration: 200ms;
        }
        .invisible {
          visibility: hidden;
        }
        .visible {
          visibility: visible;
        }
      `}</style>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="px-4 pt-2 pb-4 bg-white border-t border-gray-200 md:hidden overflow-y-auto max-h-[70vh]">
          {navItems.map((item, index) => (
            <div key={item.href} className="py-1">
              <div className="flex justify-between items-center">
                <Link
                  href={item.href}
                  className={`px-3 py-2 text-base font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-primary-50 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.hasDropdown && (
                  <button 
                    onClick={() => handleDropdownToggle(index)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <FiChevronDown 
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        openDropdowns[index] ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </button>
                )}
              </div>
              
              {/* Mobile Dropdown */}
              {item.hasDropdown && openDropdowns[index] && item.dropdownItems && (
                <div className="pl-4 mt-1 border-l-2 border-gray-100">
                  {item.dropdownItems.map((dropdownItem, dIndex) => (
                    <div key={`mobile-${item.href}-${dIndex}`} className="py-1">
                      <div className="flex justify-between items-center">
                        <Link
                          href={dropdownItem.href}
                          className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
                          onClick={() => !dropdownItem.hasSubDropdown && setMobileMenuOpen(false)}
                        >
                          {dropdownItem.label}
                        </Link>
                        {dropdownItem.hasSubDropdown && (
                          <button 
                            onClick={() => handleSubDropdownToggle(index, dIndex)}
                            className="p-2 rounded-md hover:bg-gray-100"
                          >
                            <FiChevronDown 
                              className={`w-4 h-4 text-gray-500 transition-transform ${
                                openSubDropdowns[index] === dIndex ? 'transform rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      
                      {/* Mobile Sub-dropdown */}
                      {dropdownItem.hasSubDropdown && openSubDropdowns[index] === dIndex && dropdownItem.subItems && (
                        <div className="pl-4 mt-1 border-l-2 border-gray-100">
                          {dropdownItem.subItems.map((subItem, sIndex) => (
                            <Link
                              key={`mobile-${dropdownItem.href}-${sIndex}`}
                              href={subItem.href}
                              className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {user ? (
            <div className="mt-4 flex justify-center">
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 text-base font-medium text-center text-white bg-primary rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Dashboard
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="block px-3 py-2 mt-4 text-base font-medium text-center text-white bg-primary rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login / Register
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}