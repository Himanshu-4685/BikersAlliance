import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for BikersAlliance - Learn about the rules and guidelines for using our platform.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using BikersAlliance ("the Platform," "we," "us," or "our"), you accept 
                and agree to be bound by the terms and provision of this agreement. If you do not agree 
                to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily access BikersAlliance for personal, non-commercial 
                transitory viewing only. This is the grant of a license, not a transfer of title, and 
                under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Registration</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features of our platform, you may be required to create an account. 
                When creating an account, you must provide accurate, complete, and current information.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for safeguarding your account credentials and for all activities 
                that occur under your account. You must notify us immediately of any unauthorized 
                use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When using our platform, you agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or harvest data</li>
                <li>Impersonate any person or entity</li>
                <li>Distribute spam or unsolicited communications</li>
                <li>Engage in any activity that could harm our platform or users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Listings</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 User-Generated Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Users may submit reviews, comments, and other content. By submitting content, you 
                grant us a non-exclusive, royalty-free, perpetual license to use, modify, and 
                display such content on our platform.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Bike Listings and Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to provide accurate and up-to-date information about motorcycles, prices, 
                and specifications. However, we do not guarantee the accuracy or completeness of 
                this information and are not responsible for any errors or omissions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Dealer and Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our platform may connect you with authorized dealers and third-party service providers. 
                We are not responsible for the quality of services, products, or transactions between 
                you and these third parties. Any disputes should be resolved directly with the 
                respective party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Our collection and use of personal information is 
                governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The service and its original content, features, and functionality are and will remain 
                the exclusive property of BikersAlliance and its licensors. The service is protected 
                by copyright, trademark, and other laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The materials on BikersAlliance are provided on an 'as is' basis. BikersAlliance 
                makes no warranties, expressed or implied, and hereby disclaims and negates all other 
                warranties including without limitation, implied warranties or conditions of 
                merchantability, fitness for a particular purpose, or non-infringement of intellectual 
                property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In no event shall BikersAlliance or its suppliers be liable for any damages (including, 
                without limitation, damages for loss of data or profit, or due to business interruption) 
                arising out of the use or inability to use the materials on BikersAlliance, even if 
                BikersAlliance or an authorized representative has been notified orally or in writing 
                of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Accuracy of Materials</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The materials appearing on BikersAlliance could include technical, typographical, or 
                photographic errors. BikersAlliance does not warrant that any of the materials on its 
                website are accurate, complete, or current. BikersAlliance may make changes to the 
                materials contained on its website at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modification of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BikersAlliance may revise these terms of service at any time without notice. By using 
                this platform, you are agreeing to be bound by the then current version of these terms 
                of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account and bar access to the service immediately, 
                without prior notice or liability, under our sole discretion, for any reason whatsoever 
                and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These terms and conditions are governed by and construed in accordance with the laws 
                of India and you irrevocably submit to the exclusive jurisdiction of the courts in 
                that State or location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@bikersalliance.com</p>
                <p className="text-gray-700"><strong>Address:</strong> BikersAlliance, India</p>
                <p className="text-gray-700"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}