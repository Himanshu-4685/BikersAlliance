const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://csvzysxiuuzcsmpknehi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdnp5c3hpdXV6Y3NtcGtuZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjQwNzksImV4cCI6MjA3NTQwMDA3OX0.ChDLwTvYmunBmiL_LWZqm4pWq3d2OGyjARWtA3KKZ90'
);

async function checkBenelliData() {
  try {
    const { data, error } = await supabase
      .from('variants')
      .select('variant_id, variant_name, models!inner(model_name), brands!inner(brand_name)')
      .ilike('brands.brand_name', '%benelli%')
      .limit(5);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Benelli sample data:');
    data.forEach(item => {
      console.log('Brand:', item.brands?.brand_name);
      console.log('Model:', item.models?.model_name);
      console.log('Variant:', item.variant_name);
      console.log('Final name (current):', `${item.models?.model_name} ${item.variant_name}`);
      console.log('---');
    });
  } catch (err) {
    console.error('Script error:', err.message);
  }
}

checkBenelliData();