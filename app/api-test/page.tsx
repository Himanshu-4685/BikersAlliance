'use client';

import React from 'react';

interface ApiResult {
  slug: string;
  data: any;
}

export default function ApiTestPage() {
  const [result, setResult] = React.useState<ApiResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const testSlugs = [
    'classic-350',
    'splendor-plus',
    'activa-6g',
    'pulsar-150',
    'r15-v4'
  ];

  const testApi = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/models/${slug}`);
      const data = await response.json();
      setResult({ slug, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test API Endpoints</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {testSlugs.map(slug => (
            <button
              key={slug}
              onClick={() => testApi(slug)}
              className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {slug}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Result for: {result.slug}</h3>
          <pre className="bg-white p-4 rounded border overflow-auto text-sm">
            {JSON.stringify(result.data, null, 2)}
          </pre>
          
          {result.data.success && (
            <div className="mt-4">
              <a
                href={`/bikes/${result.slug}`}
                target="_blank"
                className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                View Bike Page
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}