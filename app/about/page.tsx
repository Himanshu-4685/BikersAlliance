import type { Metadata } from 'next';
import Image from 'next/image';
import { FiUsers, FiTarget, FiHeart, FiAward, FiTrendingUp, FiShield } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'About Us - BikersAlliance',
  description: 'Learn about BikersAlliance - India\'s premier motorcycle marketplace. Our mission, vision, and commitment to connecting bike enthusiasts across the country.',
  keywords: ['about bikersalliance', 'motorcycle marketplace', 'bike community', 'indian bikes', 'two wheeler platform'],
};

export default function AboutUs() {
  const stats = [
    { icon: FiUsers, label: 'Active Users', value: '50,000+' },
    { icon: FiTarget, label: 'Bikes Listed', value: '10,000+' },
    { icon: FiHeart, label: 'Satisfied Customers', value: '25,000+' },
    { icon: FiAward, label: 'Dealer Partners', value: '500+' },
  ];

  const values = [
    {
      icon: FiTrendingUp,
      title: 'Innovation',
      description: 'We continuously innovate to provide the best user experience and cutting-edge features for bike enthusiasts.'
    },
    {
      icon: FiHeart,
      title: 'Passion',
      description: 'Our team shares a genuine passion for motorcycles and the biking community, driving everything we do.'
    },
    {
      icon: FiShield,
      title: 'Trust',
      description: 'We build trust through transparency, authentic reviews, and verified dealer information.'
    },
    {
      icon: FiUsers,
      title: 'Community',
      description: 'We foster a vibrant community where bikers can connect, share experiences, and help each other.'
    }
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: '/team/ceo.jpg',
      description: 'A passionate biker with 15+ years in the automotive industry, leading BikersAlliance\'s vision.'
    },
    {
      name: 'Priya Sharma',
      role: 'Chief Technology Officer',
      image: '/team/cto.jpg',
      description: 'Tech enthusiast with expertise in building scalable platforms for automotive marketplaces.'
    },
    {
      name: 'Amit Patel',
      role: 'Head of Marketing',
      image: '/team/marketing.jpg',
      description: 'Digital marketing expert focused on connecting with the biking community across India.'
    },
    {
      name: 'Sneha Gupta',
      role: 'Customer Success Manager',
      image: '/team/customer.jpg',
      description: 'Dedicated to ensuring every customer has the best experience on our platform.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About BikersAlliance
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              India's premier motorcycle marketplace, connecting passionate bikers with their dream rides since 2020
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  BikersAlliance was born from a simple idea: to create the most comprehensive and trustworthy platform for motorcycle enthusiasts in India. Founded in 2020 by a group of passionate bikers, we understood the challenges faced when buying, selling, or simply exploring the world of motorcycles.
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  What started as a small initiative to help fellow bikers has grown into India's leading motorcycle marketplace, serving over 50,000 active users and partnering with 500+ authorized dealers across the country.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Today, we continue to innovate and expand our services, always keeping the biking community at the heart of everything we do.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <FiUsers className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-800">Building Communities</p>
                    <p className="text-gray-600 mt-2">Connecting bikers across India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <FiTarget className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  To democratize access to motorcycle information and create a transparent, trustworthy marketplace where every biker can make informed decisions. We strive to bridge the gap between buyers, sellers, and dealers while fostering a strong community of motorcycle enthusiasts.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <FiTrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To become the most trusted and comprehensive motorcycle ecosystem in India, empowering millions of bikers with the tools, information, and community they need to pursue their passion for riding and make the best choices for their journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide our work and define our commitment to the biking community
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The passionate individuals behind BikersAlliance, working tirelessly to serve the biking community
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center group hover:shadow-xl transition-shadow">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FiUsers className="w-12 h-12 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose BikersAlliance?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're more than just a marketplace - we're your trusted partner in your biking journey
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <FiShield className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Information</h3>
                <p className="text-gray-700">
                  All our listings are verified, and we work only with authorized dealers to ensure authenticity and reliability.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <FiUsers className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community Driven</h3>
                <p className="text-gray-700">
                  Our platform is built by bikers, for bikers. We understand your needs because we share your passion.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                <FiHeart className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Customer First</h3>
                <p className="text-gray-700">
                  Your satisfaction is our priority. We provide comprehensive support throughout your buying journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the BikersAlliance Community
            </h2>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              Whether you're buying your first bike or you're a seasoned rider, we're here to support your journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/bikes"
                className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Explore Bikes
              </a>
              <a
                href="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}