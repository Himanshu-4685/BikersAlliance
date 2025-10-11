import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface Brand {
  brand_id: string;
  brand_name: string;
  logo_url: string | null;
  country?: string;
  description?: string;
  created_at?: string;
}

export async function getBrands(): Promise<Brand[]> {
  try {
    console.log('🔄 Fetching brands from database...');
    
    const { data, error } = await supabase
      .from('brands')
      .select('brand_id, brand_name, logo_url, country, description')
      .order('brand_name', { ascending: true });

    if (error) {
      console.error('❌ Supabase error fetching brands:', error);
      throw error;
    }

    console.log('✅ Successfully fetched brands:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Error in getBrands function:', err);
    throw err;
  }
}

export async function getBrandById(brandId: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('brand_id, brand_name, logo_url, country, description')
    .eq('brand_id', brandId)
    .single();

  if (error) {
    console.error('Error fetching brand by ID:', error);
    return null;
  }

  return data;
}

export async function getBrandByName(brandName: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('brand_id, brand_name, logo_url, country, description')
    .eq('brand_name', brandName)
    .single();

  if (error) {
    console.error('Error fetching brand by name:', error);
    return null;
  }

  return data;
}