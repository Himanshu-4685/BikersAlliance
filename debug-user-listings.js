// Debug script to check user bike listings
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtnpzqfgvqnzrqcfauzs.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bnB6cWZndnFuenJxY2ZhdXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjcwMTksImV4cCI6MjA1MDIwMzAxOX0.6bHMixsqMqD10hP1gIeS0RqCRjPBuwYLJVQmC-YpLu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserListings() {
  console.log('🔍 Debugging User Bike Listings...\n');
  
  try {
    // First, check if we have any used bikes with BMW in the brand
    console.log('1. Checking for BMW listings in used_bikes table...');
    const { data: bmwBikes, error: bmwError } = await supabase
      .from('used_bikes')
      .select('*')
      .ilike('brand', '%bmw%');
    
    if (bmwError) {
      console.error('Error fetching BMW bikes:', bmwError);
      return;
    }
    
    console.log(`Found ${bmwBikes?.length || 0} BMW listings:`);
    bmwBikes?.forEach((bike, index) => {
      console.log(`${index + 1}. ID: ${bike.id}`);
      console.log(`   Brand: ${bike.brand}`);
      console.log(`   Model: ${bike.model}`);
      console.log(`   Status: ${bike.status}`);
      console.log(`   City: ${bike.city}`);
      console.log(`   Created: ${bike.created_at}`);
      console.log(`   Sold At: ${bike.sold_at}`);
      console.log('');
    });

    // Check user bike submissions for a specific user email
    console.log('\n2. Checking user bike submissions...');
    
    // First find the user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'himanshurao4685@gmail.com');
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('No user found with email himanshurao4685@gmail.com');
      return;
    }
    
    const user = users[0];
    console.log(`Found user: ${user.name} (${user.email})`);
    
    // Now check their submissions
    const { data: submissions, error: submissionError } = await supabase
      .from('user_bike_submissions')
      .select(`
        id,
        submission_status,
        created_at,
        used_bikes (
          id,
          brand,
          model,
          variant,
          status,
          expected_price,
          city,
          approved_at,
          sold_at
        )
      `)
      .eq('user_id', user.user_id);
      
    if (submissionError) {
      console.error('Error fetching submissions:', submissionError);
      return;
    }
    
    console.log(`\nFound ${submissions?.length || 0} submissions for user:`);
    submissions?.forEach((submission, index) => {
      const bike = submission.used_bikes;
      console.log(`${index + 1}. Submission ID: ${submission.id}`);
      console.log(`   Submission Status: ${submission.submission_status}`);
      console.log(`   Bike ID: ${bike.id}`);
      console.log(`   Bike: ${bike.brand} ${bike.model} ${bike.variant || ''}`);
      console.log(`   Bike Status: ${bike.status}`);
      console.log(`   Price: ₹${bike.expected_price?.toLocaleString()}`);
      console.log(`   City: ${bike.city}`);
      console.log(`   Approved At: ${bike.approved_at}`);
      console.log(`   Submission Created: ${submission.created_at}`);
      console.log('');
    });
    
    // Check if any approved bikes exist in the used bikes table by city
    console.log('\n3. Checking approved bikes by city...');
    const { data: approvedBikes, error: approvedError } = await supabase
      .from('used_bikes')
      .select('*')
      .eq('status', 'approved')
      .is('sold_at', null);
      
    if (approvedError) {
      console.error('Error fetching approved bikes:', approvedError);
      return;
    }
    
    console.log(`Found ${approvedBikes?.length || 0} approved unsold bikes:`);
    approvedBikes?.forEach((bike, index) => {
      console.log(`${index + 1}. ${bike.brand} ${bike.model} in ${bike.city} - ₹${bike.expected_price?.toLocaleString()}`);
    });

  } catch (error) {
    console.error('Error in debug script:', error);
  }
}

// Run the debug function
debugUserListings().catch(console.error);