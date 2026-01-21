import { Metadata } from 'next';
import MaintenancePage from '@/components/MaintenancePage';

export const metadata: Metadata = {
  title: 'Page Not Found - BikersAlliance',
  description: 'The page you are looking for could not be found. It may be under maintenance or temporarily unavailable.',
};

export default function NotFound() {
  return (
    <MaintenancePage
      title="Page Not Found"
      message="The page you are looking for could not be found. It may be under maintenance or temporarily unavailable. Please check the URL and try again."
      backUrl="/"
      backText="Go to Homepage"
    />
  );
}