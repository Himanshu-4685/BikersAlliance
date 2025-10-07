'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the provider from the query parameters
        const provider = searchParams.get('provider');
        const simulatedAuth = searchParams.get('simulatedAuth');
        
        if (simulatedAuth === 'true') {
          // Simulate successful authentication
          localStorage.setItem('auth-token', 'simulated-auth-token');
          
          // Redirect to the home page or dashboard after successful authentication
          router.push('/');
          return;
        }
        
        // If we reach here, it's not a simulated auth so there was an error
        console.error('Error during auth callback: No valid authentication found');
        router.push('/login?error=Authentication%20failed');
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        router.push('/login?error=Authentication%20failed');
      }
    };
    
    handleAuthCallback();
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Please wait</h1>
        <p className="mt-4 text-gray-600">You are being redirected...</p>
        <div className="flex justify-center mt-6">
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}