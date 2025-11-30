import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bike Loan EMI Calculator | Calculate Two Wheeler EMI | BikersAlliance',
  description: 'Calculate your bike loan EMI with our free calculator. Get instant EMI calculations for your two-wheeler loan with different tenure and interest rate options.',
  keywords: ['bike EMI calculator', 'two wheeler loan calculator', 'motorcycle EMI', 'bike loan EMI', 'vehicle loan calculator'],
  openGraph: {
    title: 'Bike Loan EMI Calculator - Calculate Your Monthly EMI',
    description: 'Calculate exact EMI for your bike loan. Get instant results with our easy-to-use EMI calculator.',
    type: 'website',
  },
};

// Minimal layout required by Next.js app router
export default function EMICalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}