import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Complete sitemap for BikersAlliance - Find all pages and sections of our motorcycle platform.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: "Main Pages",
      links: [
        { href: "/", label: "Home" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Support" },
        { href: "/search", label: "Search" },
      ]
    },
    {
      title: "Motorcycles & Scooters",
      links: [
        { href: "/bikes", label: "All Bikes" },
        { href: "/bikes/all", label: "New Bikes" },
        { href: "/scooters", label: "All Scooters" },
        { href: "/electric", label: "Electric Vehicles" },
        { href: "/upcoming-bikes", label: "Upcoming Bikes" },
        { href: "/latest-bikes", label: "Latest Bikes" },
        { href: "/used-bikes", label: "Used Bikes" },
      ]
    },
    {
      title: "Brands",
      links: [
        { href: "/brands", label: "All Brands" },
        { href: "/brands-list", label: "Brands List" },
        { href: "/brands/honda", label: "Honda" },
        { href: "/brands/hero", label: "Hero" },
        { href: "/brands/bajaj", label: "Bajaj" },
        { href: "/brands/yamaha", label: "Yamaha" },
        { href: "/brands/tvs", label: "TVS" },
        { href: "/brands/royal-enfield", label: "Royal Enfield" },
        { href: "/brands/suzuki", label: "Suzuki" },
        { href: "/brands/ktm", label: "KTM" },
        { href: "/brands/kawasaki", label: "Kawasaki" },
        { href: "/brands/ducati", label: "Ducati" },
        { href: "/brands/bmw", label: "BMW" },
        { href: "/brands/harley-davidson", label: "Harley Davidson" },
      ]
    },
    {
      title: "Categories",
      links: [
        { href: "/bikes/type/cruiser", label: "Cruiser Bikes" },
        { href: "/bikes/type/sports", label: "Sports Bikes" },
        { href: "/bikes/type/commuter", label: "Commuter Bikes" },
        { href: "/bikes/type/adventure", label: "Adventure Bikes" },
        { href: "/bikes/type/naked", label: "Naked Bikes" },
        { href: "/bikes/type/touring", label: "Touring Bikes" },
      ]
    },
    {
      title: "Tools & Services",
      links: [
        { href: "/compare", label: "Compare Bikes" },
        { href: "/tools", label: "Tools" },
        { href: "/finance", label: "Bike Finance" },
        { href: "/showrooms", label: "Showrooms & Dealers" },
        { href: "/sell-bike", label: "Sell Your Bike" },
      ]
    },
    {
      title: "News & Information",
      links: [
        { href: "/news", label: "Bike News" },
        { href: "/news/category/general", label: "General News" },
        { href: "/news/category/launches", label: "New Launches" },
        { href: "/news/category/reviews", label: "Reviews" },
        { href: "/news/category/industry", label: "Industry News" },
        { href: "/news/category/updates", label: "Updates" },
        { href: "/news/category/electric", label: "Electric Vehicle News" },
        { href: "/videos", label: "Videos" },
        { href: "/web-stories", label: "Web Stories" },
      ]
    },
    {
      title: "User Account",
      links: [
        { href: "/register", label: "Register" },
        { href: "/login", label: "Login" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/orders", label: "My Orders" },
        { href: "/dashboard/shortlisted", label: "Shortlisted Vehicles" },
        { href: "/dashboard/activity", label: "My Activity" },
        { href: "/dashboard/settings", label: "Account Settings" },
      ]
    },
    {
      title: "Newsletter & Communication",
      links: [
        { href: "/newsletter", label: "Newsletter" },
        { href: "/confirm-email", label: "Confirm Email" },
      ]
    },
    {
      title: "Legal & Information",
      links: [
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms-conditions", label: "Terms & Conditions" },
        { href: "/sitemap", label: "Sitemap" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sitemap</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete navigation guide to all pages and sections available on BikersAlliance. 
              Find everything from motorcycle listings to user account pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitemapSections.map((section) => (
              <div key={section.title} className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-primary hover:text-primary-700 hover:underline transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Need Help Finding Something?
              </h3>
              <p className="text-gray-700 mb-4">
                Can't find what you're looking for? Try our search functionality or contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/search"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
                >
                  Search Site
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-2 bg-white text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-center"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Last updated: {new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="mt-1">
              This sitemap is automatically updated to reflect the current structure of BikersAlliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}