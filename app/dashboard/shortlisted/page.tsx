'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShortlistedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard with shortlisted section
    router.replace('/dashboard?section=shortlisted');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your shortlisted vehicles...</p>
      </div>
    </div>
  );
}