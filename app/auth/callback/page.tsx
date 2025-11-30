'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext.supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        console.error('Supabase client not available');
        router.push('/login?error=Authentication%20service%20unavailable');
        return;
      }

      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=Authentication%20failed');
          return;
        }
        
        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session found, redirect to login
          router.push('/login?error=Authentication%20failed');
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        router.push('/login?error=Authentication%20failed');
      }
    };
    
    handleAuthCallback();
  }, [router, supabase]);
  
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