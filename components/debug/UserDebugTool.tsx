'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext.supabase';
import { createClient } from '@/utils/supabase/client';

export default function UserDebugTool() {
  const { user, supabase } = useAuth();
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkUsers = async () => {
    if (!supabase) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Check auth.users (this requires admin privileges, might fail)
      const { data: authData, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data, created_at')
        .limit(10);

      if (authError) {
        console.log('Auth users check failed (expected if not admin):', authError);
      } else {
        setAuthUsers(authData || []);
      }

      // Check public.users
      const { data: publicData, error: publicError } = await supabase
        .from('users')
        .select('*')
        .limit(10);

      if (publicError) {
        setError(`Error fetching public users: ${publicError.message}`);
      } else {
        setPublicUsers(publicData || []);
      }

    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async () => {
    if (!user || !supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          avatar_url: user.avatarUrl
        })
        .select()
        .single();

      if (error) {
        setError(`Error creating profile: ${error.message}`);
      } else {
        setError('');
        alert('User profile created successfully!');
        await checkUsers(); // Refresh the data
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Registration Debug Tool</h1>
      
      {user && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">Current User (from Auth Context)</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Full Name:</strong> {user.fullName || 'Not set'}</p>
          <p><strong>Avatar URL:</strong> {user.avatarUrl || 'Not set'}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={checkUsers}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
        >
          {loading ? 'Checking...' : 'Check Users Tables'}
        </button>
        
        {user && (
          <button
            onClick={createUserProfile}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Create User Profile Manually
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Auth Users (Supabase Auth)</h2>
          <div className="bg-gray-50 p-4 rounded">
            {authUsers.length > 0 ? (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(authUsers, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">
                No data (requires admin access or check manually in Supabase dashboard)
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Public Users Table</h2>
          <div className="bg-gray-50 p-4 rounded">
            {publicUsers.length > 0 ? (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(publicUsers, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No users found in public.users table</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Debugging Steps:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Register a new account through the signup form</li>
          <li>Check your email for confirmation (if email confirmation is enabled)</li>
          <li>Come back here and click "Check Users Tables"</li>
          <li>You should see the user in Auth but may not see them in Public Users</li>
          <li>If missing from Public Users, click "Create User Profile Manually"</li>
          <li>Run the SQL scripts in the sql-schemas folder to set up automatic triggers</li>
        </ol>
      </div>
    </div>
  );
}