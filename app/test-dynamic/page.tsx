import Link from 'next/link';

export default function TestPage() {
  const testSlugs = [
    'classic-350',
    'pulsar-150',
    'honda-activa',
    'yamaha-r15',
    'splendor-plus'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Dynamic Pages</h1>
      
      <div className="grid gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Test Bike Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSlugs.map(slug => (
              <Link 
                key={slug} 
                href={`/bikes/${slug}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">{slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div className="text-sm text-gray-500">View bike details</div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Test Scooter Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSlugs.map(slug => (
              <Link 
                key={slug} 
                href={`/scooters/${slug}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">{slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div className="text-sm text-gray-500">View scooter details</div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Test API Endpoints</h2>
          <div className="space-y-2">
            {testSlugs.map(slug => (
              <Link 
                key={slug}
                href={`/api/models/${slug}`}
                target="_blank"
                className="block p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                /api/models/{slug}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}