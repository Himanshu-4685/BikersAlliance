import Image from 'next/image';
import Hero from '@/components/home/Hero';
import BrandList from '@/components/home/BrandList';
import FeaturedBikes from '@/components/home/FeaturedBikes';
import PopularScooters from '@/components/home/PopularScooters';
import UpcomingBikes from '@/components/home/UpcomingBikes';
import LatestBikes from '@/components/home/LatestBikes';
import PopularComparisons from '@/components/home/PopularComparisons';
import ElectricBikes from '@/components/home/ElectricBikes';
import WebStories from '@/components/home/WebStories';
import DealersSection from '@/components/bikes/DealersSection';

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Brands Section */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <BrandList />
        </div>
      </section>
      
      {/* Featured Bikes Section */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Bikes in Spotlight</h2>
            <a href="/bikes" className="text-sm text-primary hover:underline">
              View All Bikes
            </a>
          </div>
          <FeaturedBikes />
        </div>
      </section>
      
      {/* Popular Scooters */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Scooters in Spotlight</h2>
            <a href="/scooters" className="text-sm text-primary hover:underline">
              View All Scooters
            </a>
          </div>
          <PopularScooters />
        </div>
      </section>
      
      {/* Upcoming Bikes Section */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Upcoming Bikes & Scooters</h2>
            <a href="/upcoming-bikes" className="text-sm text-primary hover:underline">
              View All Upcoming
            </a>
          </div>
          <UpcomingBikes />
        </div>
      </section>
      
      {/* Latest Bikes */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Latest Bikes & Scooters</h2>
            <a href="/latest-bikes" className="text-sm text-primary hover:underline">
              View All Latest
            </a>
          </div>
          <LatestBikes />
        </div>
      </section>
      
      {/* Popular Comparisons */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Popular Comparisons</h2>
            <a href="/compare-bikes" className="text-sm text-primary hover:underline">
              Compare Bikes
            </a>
          </div>
          <PopularComparisons />
        </div>
      </section>
      
      {/* Electric Bikes */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Electric Bikes in India</h2>
            <a href="/electric-bikes" className="text-sm text-primary hover:underline">
              View All Electric Bikes
            </a>
          </div>
          <ElectricBikes />
        </div>
      </section>
      
      {/* Web Stories */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Web Stories</h2>
            <a href="/web-stories" className="text-sm text-primary hover:underline">
              View All Stories
            </a>
          </div>
          <WebStories />
        </div>
      </section>
      
      {/* Used Bikes Nearby */}
      <DealersSection />
    </>
  );
}