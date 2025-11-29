import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext.supabase';
import { ComparisonProvider } from '@/context/ComparisonContext';
import { WishlistProvider } from '@/context/WishlistContext';
import ComparisonBar from '@/components/comparison/ComparisonBar';
import LoadingSpinner from '@/components/common/LoadingComponents';

// Optimized font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// Metadata for SEO
export const metadata: Metadata = {
  title: {
    default: 'BikersAlliance - Motorcycle Community & Marketplace',
    template: '%s | BikersAlliance'
  },
  description: 'Find your perfect bike, compare models, read reviews, and connect with dealers at BikersAlliance - India\'s premier motorcycle marketplace.',
  keywords: ['bikes', 'motorcycles', 'two wheelers', 'bike comparison', 'bike reviews', 'bike prices', 'dealer locator'],
  authors: [{ name: 'BikersAlliance Team' }],
  creator: 'BikersAlliance',
  publisher: 'BikersAlliance',
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        {/* Manifest and icons */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect for critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Critical CSS will be inlined by Next.js automatically */}
      </head>
      <body className="antialiased">
        <AuthProvider>
          <WishlistProvider>
            <ComparisonProvider>
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading BikersAlliance..." />}>
                <Header />
              </Suspense>
              
              <main className="min-h-screen">
                <Suspense fallback={<LoadingSpinner size="lg" text="Loading content..." />}>
                  {children}
                </Suspense>
              </main>
              
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
              
              <Suspense fallback={null}>
                <ComparisonBar />
              </Suspense>
            </ComparisonProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}