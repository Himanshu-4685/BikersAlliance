'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  FiHome,
  FiTruck,
  FiShoppingBag,
  FiEye,
  FiSettings,
  FiUsers,
  FiBookOpen,
  FiStar,
  FiImage,
  FiMail,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiShoppingCart
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
  { name: 'Brands', href: '/admin/brands', icon: FiTruck },
  { name: 'Models', href: '/admin/models', icon: FiShoppingBag },
  { name: 'Variants', href: '/admin/variants', icon: FiEye },
  { name: 'Specifications', href: '/admin/specifications', icon: FiSettings },
  { name: 'Status & Launches', href: '/admin/status', icon: FiActivity },
  { name: 'Bookings', href: '/admin/bookings', icon: FiBookOpen },
  { name: 'Used Bikes', href: '/admin/used-bikes', icon: FiShoppingCart },
  { name: 'Reviews', href: '/admin/reviews', icon: FiStar },
  { name: 'Users', href: '/admin/users', icon: FiUsers },
  { name: 'Images', href: '/admin/images', icon: FiImage },
  { name: 'News', href: '/admin/news', icon: FiBookOpen },
  { name: 'Videos', href: '/admin/videos', icon: FiEye },
  { name: 'Web Stories', href: '/admin/web-stories', icon: FiStar },
  { name: 'Newsletter', href: '/admin/newsletter', icon: FiMail },
  { name: 'Settings', href: '/admin/settings', icon: FiSettings },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { admin, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/admin/login');
    }
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">BikersAlliance</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <FiChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <FiChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                  ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`
                  ${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && admin && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
            <p className="text-xs text-indigo-600 font-medium capitalize">{admin.role}</p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <FiLogOut className={`h-5 w-5 ${collapsed ? 'mr-0' : 'mr-3'}`} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}