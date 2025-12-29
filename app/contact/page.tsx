import type { Metadata } from 'next';
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageSquare, FiHelpCircle } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Contact Support',
  description: 'Get in touch with BikersAlliance support team. We are here to help with your motorcycle queries, technical issues, and general assistance.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need help? Our dedicated support team is here to assist you with any questions or issues you may have.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FiMail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
                    <p className="text-gray-600 mb-2">For general inquiries and support</p>
                    <a href="mailto:support@bikersalliance.com" className="text-primary hover:underline">
                      support@bikersalliance.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FiPhone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Phone Support</h3>
                    <p className="text-gray-600 mb-2">Available Monday to Saturday</p>
                    <a href="tel:+91-XXXXXXXXXX" className="text-primary hover:underline">
                      +91-XXXXXXXXXX
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FiMapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Office Address</h3>
                    <p className="text-gray-600">
                      BikersAlliance Headquarters<br />
                      Technology Hub, India<br />
                      PIN: XXXXXX
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FiClock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Help</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiHelpCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-gray-900">Frequently Asked Questions</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Find answers to common questions about bike specifications, comparisons, and platform usage.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiMessageSquare className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-gray-900">Live Chat Support</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Get instant help during business hours through our live chat feature.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="bike-info">Bike Information</option>
                  <option value="dealer">Dealer Inquiry</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                  placeholder="Please describe your inquiry in detail..."
                ></textarea>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/terms-conditions" className="text-primary hover:underline">
                    Terms & Conditions
                  </a>
                  *
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Send Message
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Response Time:</strong> We typically respond to inquiries within 24-48 hours during business days.
                For urgent matters, please call our support line directly.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Support Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Center</h3>
            <p className="text-gray-600 text-sm mb-4">
              Browse our comprehensive help documentation and guides.
            </p>
            <a href="#" className="text-primary hover:underline text-sm font-medium">
              Visit Help Center →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Forum</h3>
            <p className="text-gray-600 text-sm mb-4">
              Connect with other bikers and get community support.
            </p>
            <a href="#" className="text-primary hover:underline text-sm font-medium">
              Join Forum →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              24/7 emergency assistance for critical issues.
            </p>
            <a href="tel:+91-XXXXXXXXXX" className="text-primary hover:underline text-sm font-medium">
              Call Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}