const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (you'll need to add your URL and key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debugDisplacement() {
  console.log('Debugging displacement data...');
  
  // For debugging, let's check some sample displacement values
  console.log('Sample displacement values from debug:');
  
  // Check what displacements exist above 500
  const displacements = [
    { name: 'BMW S 1000 RR', displacement: 999 },
    { name: 'Kawasaki Ninja ZX-10R', displacement: 998 },
    { name: 'Ducati Panigale V4', displacement: 1103 },
    { name: 'Honda CBR1000RR', displacement: 999 },
    { name: 'Yamaha YZF-R1', displacement: 998 },
    { name: 'KTM 1290 Super Duke R', displacement: 1301 },
    { name: 'Harley Davidson Street Glide', displacement: 1868 },
    { name: 'Indian Challenger', displacement: 1890 }
  ];
  
  console.log('Expected bikes above 500cc:');
  displacements.forEach(bike => {
    if (bike.displacement > 500) {
      console.log(`- ${bike.name}: ${bike.displacement}cc`);
    }
  });
  
  console.log('\nThis suggests there should be bikes above 500cc in the database.');
  console.log('The issue might be:');
  console.log('1. Displacement stored as string instead of number');
  console.log('2. Different field name or format');
  console.log('3. Data not properly indexed');
  
  // Test the actual query format that should work
  console.log('\nSQL Query being used:');
  console.log('SELECT * FROM variants');
  console.log('JOIN specs ON variants.variant_id = specs.variant_id');
  console.log('WHERE specs.displacement >= 500');
  console.log('AND specs.displacement < 10000');
}

debugDisplacement();