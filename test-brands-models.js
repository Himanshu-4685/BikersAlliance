const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrandsWithModels() {
  console.log('Testing brands with models count...\n');

  try {
    // Test the query that the admin API uses
    const { data: brands, error } = await supabase
      .from('brands')
      .select(`
        brand_id,
        brand_name,
        logo_url,
        country,
        description,
        created_at,
        models (
          model_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return;
    }

    console.log('Brands with model counts:');
    console.log('========================');
    
    brands.forEach((brand, index) => {
      const modelsCount = brand.models ? brand.models.length : 0;
      console.log(`${index + 1}. ${brand.brand_name}`);
      console.log(`   - Models: ${modelsCount}`);
      console.log(`   - Country: ${brand.country || 'N/A'}`);
      console.log(`   - Created: ${new Date(brand.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // Summary
    const totalBrands = brands.length;
    const totalModels = brands.reduce((sum, brand) => sum + (brand.models ? brand.models.length : 0), 0);
    
    console.log('Summary:');
    console.log(`========`);
    console.log(`Total brands: ${totalBrands}`);
    console.log(`Total models: ${totalModels}`);
    console.log(`Average models per brand: ${totalBrands > 0 ? (totalModels / totalBrands).toFixed(1) : 0}`);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBrandsWithModels();