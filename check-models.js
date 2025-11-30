// Test script to check available models in the database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModels() {
  try {
    // Get available models
    const { data: models, error } = await supabase
      .from('models')
      .select(`
        model_id,
        model_name,
        brands!inner(
          brand_name
        )
      `)
      .limit(10);

    if (error) {
      console.error('Error fetching models:', error);
      return;
    }

    console.log('Available models:');
    models.forEach(model => {
      const slug = model.model_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      console.log(`${model.brands.brand_name} ${model.model_name} -> /bikes/${slug}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkModels();