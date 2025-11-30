import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electric Bike Charging Stations in India | BikersAlliance',
  description: 'Find electric bike charging stations across India. Locate nearby charging points, check availability, pricing, and amenities for your electric bike.',
  keywords: ['electric bike charging stations', 'EV charging points', 'electric bike charging', 'charging stations India', 'electric vehicle charging'],
  openGraph: {
    title: 'Electric Bike Charging Stations in India',
    description: 'Find electric bike charging stations across India with real-time availability and pricing information.',
    type: 'website',
  },
};

// Minimal layout required by Next.js app router
export default function ChargingStationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}