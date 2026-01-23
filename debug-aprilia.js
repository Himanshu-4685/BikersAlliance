const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://csvzysxiuuzcsmpknehi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdnp5c3hpdXV6Y3NtcGtuZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjQwNzksImV4cCI6MjA3NTQwMDA3OX0.ChDLwTvYmunBmiL_LWZqm4pWq3d2OGyjARWtA3KKZ90'
);

async function checkApriliaBrand() {
  console.log('Checking Aprilia brand data...\n');

  // 1. Check all brands that contain 'aprilia'
  const { data: brands, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .ilike('brand_name', '%aprilia%');

  if (brandError) {
    console.error('Error fetching Aprilia brand:', brandError);
    return;
  }

  console.log('Aprilia brands found:', brands?.length || 0);
  if (brands) {
    brands.forEach(brand => {
      console.log(' - Brand:', JSON.stringify(brand, null, 2));
    });
  }

  // 2. Also check exact case
  const { data: exactBrands, error: exactError } = await supabase
    .from('brands')
    .select('*')
    .eq('brand_name', 'Aprilia');

  if (exactError) {
    console.error('Error fetching exact Aprilia brand:', exactError);
  } else {
    console.log('\nExact Aprilia brands found:', exactBrands?.length || 0);
    if (exactBrands) {
      exactBrands.forEach(brand => {
        console.log(' - Exact Brand:', JSON.stringify(brand, null, 2));
      });
    }
  }

  // 3. Check if there are any variants for Aprilia
  if (brands && brands.length > 0) {
    for (const brand of brands) {
      console.log('\n=== Checking variants for brand:', brand.brand_name, 'ID:', brand.brand_id, '===');
      
      // Check via models -> variants relationship
      const { data: variants, error: variantsError } = await supabase
        .from('variants')
        .select(`
          variant_id,
          variant_name,
          on_road_price,
          models!inner(
            model_name,
            brand_id
          )
        `)
        .eq('models.brand_id', brand.brand_id)
        .limit(10);

      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
      } else {
        console.log('Variants found:', variants?.length || 0);
        if (variants) {
          variants.forEach(variant => {
            console.log(`  - Variant: ${variant.variant_name}, Model: ${variant.models.model_name}, Price: ₹${variant.on_road_price || 'N/A'}`);
          });
        }
      }
    }
  }

  // 4. Let's also check what happens when we search for bikes by brand 'Aprilia'
  console.log('\n=== Testing brand search for Aprilia in bikes API ===');
  const { data: bikeVariants, error: bikeError } = await supabase
    .from('variants')
    .select(`
      variant_id,
      variant_name,
      on_road_price,
      models!inner(
        model_name,
        brands!inner(brand_name)
      )
    `)
    .ilike('models.brands.brand_name', '%aprilia%')
    .limit(10);

  if (bikeError) {
    console.error('Error in bike search:', bikeError);
  } else {
    console.log('Bike variants found via brand search:', bikeVariants?.length || 0);
    if (bikeVariants) {
      bikeVariants.forEach(variant => {
        console.log(`  - Bike: ${variant.variant_name}, Model: ${variant.models.model_name}, Brand: ${variant.models.brands.brand_name}`);
      });
    }
  }

  // 5. Check brand slug generation for Aprilia
  if (brands && brands.length > 0) {
    console.log('\n=== Brand Slug Analysis ===');
    brands.forEach(brand => {
      const slug = brand.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      console.log(`Brand: "${brand.brand_name}" -> Slug: "${slug}"`);
    });
  }
}

checkApriliaBrand().catch(console.error);