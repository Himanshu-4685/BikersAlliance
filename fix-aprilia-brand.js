const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://csvzysxiuuzcsmpknehi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdnp5c3hpdXV6Y3NtcGtuZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjQwNzksImV4cCI6MjA3NTQwMDA3OX0.ChDLwTvYmunBmiL_LWZqm4pWq3d2OGyjARWtA3KKZ90'
);

async function fixApriliaBrand() {
  console.log('Fixing Aprilia brand name issue...\n');

  // 1. Find the Aprilia brand with newline
  const { data: apriliaBrands, error: fetchError } = await supabase
    .from('brands')
    .select('*')
    .ilike('brand_name', '%aprilia%');

  if (fetchError) {
    console.error('Error fetching Aprilia brand:', fetchError);
    return;
  }

  if (!apriliaBrands || apriliaBrands.length === 0) {
    console.log('No Aprilia brands found');
    return;
  }

  console.log('Found Aprilia brands:');
  apriliaBrands.forEach((brand, index) => {
    console.log(`${index + 1}. ID: ${brand.brand_id}`);
    console.log(`   Name: "${brand.brand_name}" (length: ${brand.brand_name.length})`);
    console.log(`   Has newline: ${brand.brand_name.includes('\n')}`);
    console.log(`   Cleaned name: "${brand.brand_name.trim()}"`);
  });

  // 2. Fix the brand name by removing newline
  for (const brand of apriliaBrands) {
    if (brand.brand_name.includes('\n')) {
      const cleanedName = brand.brand_name.trim();
      
      console.log(`\nUpdating brand "${brand.brand_name}" to "${cleanedName}"`);
      
      const { data: updatedBrand, error: updateError } = await supabase
        .from('brands')
        .update({
          brand_name: cleanedName
        })
        .eq('brand_id', brand.brand_id)
        .select();

      if (updateError) {
        console.error('Error updating brand:', updateError);
      } else {
        console.log('Successfully updated brand:', updatedBrand);
      }
    }
  }

  // 3. Verify the fix
  console.log('\n=== Verification ===');
  const { data: verifyBrands, error: verifyError } = await supabase
    .from('brands')
    .select('*')
    .eq('brand_name', 'Aprilia');

  if (verifyError) {
    console.error('Error verifying fix:', verifyError);
  } else {
    console.log('Verification - Exact match for "Aprilia":', verifyBrands?.length || 0);
    if (verifyBrands) {
      verifyBrands.forEach(brand => {
        console.log(`  - Brand: "${brand.brand_name}" (length: ${brand.brand_name.length})`);
      });
    }
  }

  // 4. Test brand filtering like the API does
  console.log('\n=== Testing API-style brand filtering ===');
  const { data: brandData } = await supabase
    .from('brands')
    .select('brand_id')
    .ilike('brand_name', 'Aprilia')
    .single();

  if (brandData) {
    console.log('Brand lookup successful! Brand ID:', brandData.brand_id);
  } else {
    console.log('Brand lookup failed - this indicates the issue still exists');
  }
}

fixApriliaBrand().catch(console.error);