// Debug script to check what data exists for potential electric bikes
"use server";

import { createServerClient } from "@/lib/supabase-server";

async function debugElectricBikes() {
  const supabase = createServerClient();
  
  // First, let's see what body_types exist
  const { data: bodyTypes } = await supabase
    .from('specs')
    .select('body_type')
    .not('body_type', 'is', null);
    
  console.log('Available body types:', [...new Set(bodyTypes?.map(s => s.body_type))]);
  
  // Check for any brands that might be electric
  const { data: brands } = await supabase
    .from('brands')
    .select('brand_name')
    .ilike('brand_name', '%electric%');
    
  console.log('Electric brands:', brands);
  
  // Check for models with electric in name
  const { data: models } = await supabase
    .from('models')
    .select('model_name')
    .ilike('model_name', '%electric%');
    
  console.log('Electric models:', models);
  
  // Check for variants with electric in name
  const { data: variants } = await supabase
    .from('variants')
    .select('variant_name')
    .ilike('variant_name', '%electric%');
    
  console.log('Electric variants:', variants);
}

debugElectricBikes();