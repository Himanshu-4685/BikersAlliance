'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing...');
  
  useEffect(() => {
    async function testConnection() {
      try {
        console.log('🔍 Environment check:');
        console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        const supabase = createClient();
        console.log('✅ Supabase client created');
        setStatus('Client created, testing query...');
        
        console.log('🔄 Testing brands query...');
        const { data, error } = await supabase
          .from('brands')
          .select('brand_id, brand_name')
          .limit(1);
          
        if (error) {
          setStatus(`❌ Error: ${error.message}`);
          console.error('❌ Supabase error:', error);
        } else {
          setStatus(`✅ Success! Found ${data?.length || 0} records`);
          console.log('✅ Supabase test successful:', data);
        }
      } catch (err) {
        setStatus(`❌ Failed: ${err}`);
        console.error('❌ Connection test failed:', err);
      }
    }
    
    testConnection();
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '10px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <strong>Supabase Test:</strong><br />
      {status}
    </div>
  );
}