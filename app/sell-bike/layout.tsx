import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Bike Online | Free Bike Listing | BikersAlliance',
  description: 'Sell your bike quickly and easily with BikersAlliance. Create a free listing, get genuine inquiries, and sell at the best market price.',
  keywords: ['sell bike online', 'bike selling platform', 'sell motorcycle', 'used bike selling', 'bike marketplace'],
  openGraph: {
    title: 'Sell Your Bike Online - Quick & Easy',
    description: 'List your bike for free and reach thousands of potential buyers. Get the best price for your bike.',
    type: 'website',
  },
};

// Minimal layout required by Next.js app router
export default function SellBikeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}