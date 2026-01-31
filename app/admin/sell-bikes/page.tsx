import SellBikeAdmin from '@/components/admin/SellBikeAdmin';

export const metadata = {
  title: 'Sell Bike Admin | BikersAlliance',
  description: 'Admin panel to manage bike selling submissions',
};

export default function SellBikeAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SellBikeAdmin />
    </div>
  );
}