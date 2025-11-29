const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixVariantSequence() {
  try {
    console.log('Fixing variant_id sequence...');
    
    // First, get the current max variant_id
    const { data: maxResult, error: maxError } = await supabase
      .from('variants')
      .select('variant_id')
      .order('variant_id', { ascending: false })
      .limit(1);
    
    if (maxError) {
      console.error('Error getting max variant_id:', maxError);
      return;
    }
    
    const maxVariantId = maxResult && maxResult.length > 0 ? maxResult[0].variant_id : 1;
    console.log('Current max variant_id:', maxVariantId);
    
    // Set the sequence to max + 1
    const { data: sequenceResult, error: sequenceError } = await supabase.rpc('fix_variant_sequence', {
      max_id: maxVariantId
    });
    
    if (sequenceError) {
      console.log('RPC function might not exist, trying direct SQL...');
      
      // Try using raw SQL
      const { data: sqlResult, error: sqlError } = await supabase
        .from('variants')
        .select('variant_id')
        .limit(0); // This is just to test connection
        
      console.log('Will need to fix sequence manually in database...');
      console.log(`Run this SQL query in your database:`);
      console.log(`SELECT setval('variants_variant_id_seq', ${maxVariantId + 1}, false);`);
      
    } else {
      console.log('Sequence fixed successfully!', sequenceResult);
    }
    
    console.log('Next variant_id should be:', maxVariantId + 1);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixVariantSequence();