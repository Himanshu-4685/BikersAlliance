'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiCheck, FiClock, FiUsers, FiTrendingUp, FiStar } from 'react-icons/fi';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <FiMail className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Stay Connected with the Motorcycle World
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of riders who get the latest updates on new bikes, expert reviews, 
              exclusive deals, and insider news delivered straight to their inbox.
            </p>
            
            {/* Main Newsletter Form */}
            <div className="max-w-md mx-auto">
              {/* Status Messages */}
              {subscriptionStatus.type && (
                <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
                  subscriptionStatus.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {subscriptionStatus.message}
                </div>
              )}
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 text-gray-900 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
                  required
                  disabled={isSubscribing}
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className={`px-6 py-3 font-medium text-primary transition-colors rounded-lg ${
                    isSubscribing 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </form>
              
              <p className="text-white/80 text-sm mt-3">
                Free forever. No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              What You'll Get in Every Issue
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Latest Bike Launches</h3>
                <p className="text-gray-600">
                  Be the first to know about new motorcycle launches, upcoming models, and industry announcements.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiStar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Expert Reviews</h3>
                <p className="text-gray-600">
                  In-depth reviews, performance analysis, and honest opinions from motorcycle experts and real riders.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Exclusive Deals</h3>
                <p className="text-gray-600">
                  Special offers, discounts, and exclusive deals from dealers and manufacturers across India.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community Stories</h3>
                <p className="text-gray-600">
                  Real stories from the riding community, road trip experiences, and maintenance tips.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiClock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Market Updates</h3>
                <p className="text-gray-600">
                  Price changes, market trends, and buying guides to help you make informed decisions.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Weekly Digest</h3>
                <p className="text-gray-600">
                  A curated weekly summary of the most important news and updates in the motorcycle world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12 text-gray-900">
              Join the BikersAlliance Community
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">25,000+</div>
                <div className="text-gray-600">Active Subscribers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-gray-600">Bike Reviews Published</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-gray-600">Subscriber Satisfaction</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
              <p className="text-gray-600 mb-6">
                Subscribe now and get instant access to our exclusive new subscriber welcome package, 
                including our comprehensive bike buying guide and dealer contact database.
              </p>
              
              {/* Secondary Newsletter Form */}
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    disabled={isSubscribing}
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className={`px-6 py-3 font-medium text-white transition-colors rounded-lg ${
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">How often will I receive emails?</h3>
                <p className="text-gray-600">
                  We send out a weekly newsletter every Friday with the week's most important motorcycle news, 
                  plus occasional special announcements for major launches or exclusive deals.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Is the newsletter really free?</h3>
                <p className="text-gray-600">
                  Yes, absolutely! Our newsletter is completely free and always will be. We believe in providing 
                  value to the motorcycle community without any cost.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Can I unsubscribe anytime?</h3>
                <p className="text-gray-600">
                  Of course! Every email includes an easy unsubscribe link. You can also manage your subscription 
                  preferences or unsubscribe directly from any email we send.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">What kind of content do you share?</h3>
                <p className="text-gray-600">
                  We focus on motorcycle news, new bike launches, detailed reviews, buying guides, maintenance tips, 
                  market updates, and exclusive deals from dealers across India.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Do you share my email with others?</h3>
                <p className="text-gray-600">
                  Never! We respect your privacy and will never share, sell, or rent your email address to third parties. 
                  Your information is safe with us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't Miss Out on the Latest Motorcycle Updates
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of motorcycle enthusiasts who stay informed with BikersAlliance newsletter.
          </p>
          <Link 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
              emailInput?.focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMail className="mr-2" />
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  );
}