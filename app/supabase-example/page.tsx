'use client';

import { AuthProvider } from '@/context/AuthContext.supabase';
import SupabaseExample from './SupabaseExample';
import EnvironmentChecker from './EnvironmentChecker';

export default function SupabaseExamplePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Supabase Integration Example</h1>
      
      {/* Wrap the example in its own AuthProvider to ensure it works properly */}
      <AuthProvider>
        <SupabaseExample />
      </AuthProvider>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Testing Notes</h2>
        <p>This example has its own AuthProvider to ensure it works correctly.</p>
        <p className="mt-2">If you're seeing login issues, please check:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Your Supabase credentials are correct in .env file</li>
          <li>You've created users in your Supabase auth system</li>
          <li>Your browser console for any network or JavaScript errors</li>
        </ul>
      </div>
      
      <EnvironmentChecker />
    </div>
  );
}