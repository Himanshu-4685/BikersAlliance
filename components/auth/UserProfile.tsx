'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiShoppingBag, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Get first letter of email for avatar fallback
  const getInitial = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return user?.email.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white hover:bg-primary-600 focus:outline-none"
      >
        {user?.avatarUrl ? (
          <Image 
            src={user.avatarUrl} 
            alt="Profile" 
            width={36} 
            height={36} 
            className="rounded-full"
          />
        ) : (
          <span className="text-sm font-medium">{getInitial()}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="font-medium text-gray-800">{user?.fullName || 'User'}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className="py-1">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FiUser className="mr-3 text-gray-500" />
              Dashboard
            </Link>
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FiShoppingBag className="mr-3 text-gray-500" />
              My Orders
            </Link>
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FiHeart className="mr-3 text-gray-500" />
              Shortlisted Vehicles
            </Link>
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FiSettings className="mr-3 text-gray-500" />
              Profile Settings
            </Link>
          </div>
          <div className="py-1 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FiLogOut className="mr-3 text-gray-500" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
