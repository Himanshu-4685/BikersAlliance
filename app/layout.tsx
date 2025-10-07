import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';

// Load fonts
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
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
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}