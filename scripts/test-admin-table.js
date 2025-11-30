// Test script to verify admin table and data
const { createClient } = require('@supabase/supabase-js');

async function testAdminTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
    return;
  }

  console.log('✅ Supabase environment variables found');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('\n🔍 Testing admin table access...');
    
    // First, try to query without RLS (will fail if RLS is enabled)
    const { data, error, count } = await supabase
      .from('admin')
      .select('*', { count: 'exact' });
      
    if (error) {
      console.log('❌ Error querying admin table:', error.message);
      console.log('This might be due to RLS policies. Let\'s check...');
      
      // Try a simple count
      const { count: adminCount, error: countError } = await supabase
        .from('admin')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.log('❌ Cannot access admin table at all:', countError.message);
        console.log('\n💡 Possible solutions:');
        console.log('1. Disable RLS temporarily: ALTER TABLE admin DISABLE ROW LEVEL SECURITY;');
        console.log('2. Or use service role key instead of anon key');
      } else {
        console.log('✅ Admin table exists with', adminCount, 'records');
      }
    } else {
      console.log('✅ Successfully queried admin table');
      console.log('Found', count, 'admin records');
      
      if (data && data.length > 0) {
        console.log('\n📋 Admin records:');
        data.forEach(admin => {
          console.log(`- ${admin.name} (${admin.email}) - Role: ${admin.role} - Active: ${admin.is_active}`);
        });
      }
    }
    
    // Test specific email query
    console.log('\n🔍 Testing specific email query...');
    const { data: specificAdmin, error: emailError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', 'admin@bikersalliance.com')
      .eq('is_active', true)
      .single();
      
    if (emailError) {
      console.log('❌ Error querying specific admin:', emailError.message);
    } else if (specificAdmin) {
      console.log('✅ Found admin:', specificAdmin.name, specificAdmin.email);
      console.log('Password hash length:', specificAdmin.password_hash?.length || 0);
    } else {
      console.log('❌ No admin found with email admin@bikersalliance.com');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

testAdminTable();