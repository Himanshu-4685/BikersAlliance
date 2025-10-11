'use client';

import { useEffect, useState } from 'react';

export default function EnvironmentChecker() {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: '',
    supabaseKeyStatus: false,
    message: 'Checking environment variables...'
  });

  useEffect(() => {
    // Check if environment variables are properly set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setEnvStatus({
      supabaseUrl: supabaseUrl || 'Not set',
      supabaseKeyStatus: !!supabaseKey,
      message: supabaseUrl && supabaseKey
        ? 'Environment variables appear to be correctly set!'
        : 'WARNING: Missing required Supabase environment variables!'
    });
  }, []);

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-semibold">Environment Variables Check</h3>
      <div className="mt-2">
        <p>NEXT_PUBLIC_SUPABASE_URL: <span className={envStatus.supabaseUrl !== 'Not set' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {envStatus.supabaseUrl}
        </span></p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: <span className={envStatus.supabaseKeyStatus ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {envStatus.supabaseKeyStatus ? '✓ Set' : '✗ Not set'}
        </span></p>
        <p className="mt-2 font-medium">Status: {envStatus.message}</p>
      </div>
    </div>
  );
}