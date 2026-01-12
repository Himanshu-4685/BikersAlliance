const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = 'https://kxdkllhzdkpnixqjveve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4ZGtsaGh6ZGtwbml4cWp2ZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MjkwOTcsImV4cCI6MjA0OTIwNTA5N30.QtTSDwmsNZVNcJdGE3SyfHMJxGjxgNJmBYgiTwhTQCA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserData() {
  try {
    console.log('=== Checking bookings data ===');
    
    // Get bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);
    
    if (bookingsError) {
      console.error('Bookings error:', bookingsError);
      return;
    }
    
    console.log('Bookings found:', bookings?.length);
    if (bookings && bookings.length > 0) {
      console.log('Sample booking:', bookings[0]);
      
      // Get unique user_ids
      const userIds = [...new Set(bookings.map(b => b.user_id))];
      console.log('User IDs in bookings:', userIds);
      
      // Try to get from profiles
      console.log('\n=== Checking profiles table ===');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      console.log('Profiles error:', profilesError);
      console.log('Profiles found:', profiles?.length);
      console.log('Profiles data:', profiles);
      
      // Try to get from users table
      console.log('\n=== Checking users table ===');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);
      
      console.log('Users error:', usersError);
      console.log('Users found:', users?.length);
      console.log('Users data:', users);
      
      // Check auth.users (might not work from client)
      console.log('\n=== Checking auth users (might fail) ===');
      try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        console.log('Auth error:', authError);
        if (authUsers) {
          console.log('Auth users found:', authUsers.users?.length);
          const relevantAuthUsers = authUsers.users?.filter(u => userIds.includes(u.id));
          console.log('Relevant auth users:', relevantAuthUsers);
        }
      } catch (authErr) {
        console.log('Auth admin not available from client side');
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugUserData();