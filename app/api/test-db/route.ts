import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    const { data: statusData, error } = await supabase
      .from('status')
      .select('*')
      .limit(5);

    if (error) {
      return NextResponse.json({
        error: 'Supabase query failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    // Test individual table access
    const { data: brandsData } = await supabase.from('brands').select('brand_id, brand_name').limit(3);
    const { data: modelsData } = await supabase.from('models').select('model_id, model_name').limit(3);
    const { data: variantsData } = await supabase.from('variants').select('variant_id, variant_name').limit(3);

    return NextResponse.json({
      success: true,
      message: 'API connection working',
      data: {
        statusTable: {
          count: statusData?.length || 0,
          sample: statusData?.slice(0, 2) || []
        },
        brandsTable: {
          count: brandsData?.length || 0,
          sample: brandsData?.slice(0, 2) || []
        },
        modelsTable: {
          count: modelsData?.length || 0,
          sample: modelsData?.slice(0, 2) || []
        },
        variantsTable: {
          count: variantsData?.length || 0,
          sample: variantsData?.slice(0, 2) || []
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}