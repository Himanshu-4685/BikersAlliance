import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bike Finance - Easy Loan & EMI Options | BikersAlliance',
  description: 'Get instant bike loan approval with lowest interest rates starting from 8.5%. Calculate EMI, compare offers from top banks. Zero down payment options available.',
  keywords: [
    'bike loan',
    'motorcycle finance', 
    'bike emi calculator',
    'two wheeler loan',
    'bike finance offers',
    'zero down payment',
    'instant loan approval',
    'low interest rates'
  ],
  openGraph: {
    title: 'Bike Finance - Easy Loan & EMI Options | BikersAlliance',
    description: 'Get instant bike loan approval with lowest interest rates starting from 8.5%. Calculate EMI, compare offers from top banks.',
    type: 'website',
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}