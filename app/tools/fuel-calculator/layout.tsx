import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bike Fuel Cost Calculator | Calculate Fuel Expenses | BikersAlliance',
  description: 'Calculate your bike fuel cost based on daily usage, mileage, and fuel prices. Find out how much you spend on fuel and compare with different bikes.',
  keywords: ['bike fuel calculator', 'fuel cost calculator', 'motorcycle fuel expense', 'fuel consumption calculator', 'bike mileage calculator'],
  openGraph: {
    title: 'Bike Fuel Cost Calculator - Calculate Your Fuel Expenses',
    description: 'Calculate total fuel cost for your bike based on your riding habits and compare with other vehicles.',
    type: 'website',
  },
};

// Minimal layout required by Next.js app router
export default function FuelCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}