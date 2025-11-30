import Image from 'next/image';
import Hero from '@/components/home/Hero';
import BrandList from '@/components/home/BrandList';
import FeaturedBikes from '@/components/home/FeaturedBikes';
import PopularScooters from '@/components/home/PopularScooters';
import DynamicBikeStatus from '@/components/home/DynamicBikeStatus';
import LatestBikes from '@/components/home/LatestBikes';
import PopularComparisons from '@/components/home/PopularComparisons';
import ElectricBikes from '@/components/home/ElectricBikes';
import WebStories from '@/components/home/WebStories';
import UsedBikesSection from '@/components/bikes/UsedBikesSection';

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
          <FeaturedBikes />
        </div>
      </section>
      
      {/* Popular Scooters */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <PopularScooters />
        </div>
      </section>
      
      {/* Upcoming Bikes Section */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <DynamicBikeStatus 
            status="upcoming"
            title="Upcoming Bikes & Scooters"
            viewAllLink="/upcoming-bikes"
            limit={8}
          />
        </div>
      </section>
      
      {/* Latest Bikes */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <DynamicBikeStatus 
            status="new_launch"
            title="Latest Bikes & Scooters"
            viewAllLink="/latest-bikes"
            limit={8}
          />
        </div>
      </section>
      
      {/* Popular Comparisons */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <PopularComparisons />
        </div>
      </section>
      
      {/* Electric Bikes */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <ElectricBikes />
        </div>
      </section>
      
      {/* Web Stories */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <WebStories />
        </div>
      </section>
      
      {/* Used Bikes Nearby */}
      <UsedBikesSection />
    </>
  );
}