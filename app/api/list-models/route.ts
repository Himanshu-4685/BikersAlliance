import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get some sample models to test with
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
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    // Type assertion to fix TypeScript inference issue
    const formattedModels = (models as any)?.map((model: any) => ({
      id: model.model_id,
      name: model.model_name,
      brand: model.brands?.brand_name,
      slug: model.model_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      testUrl: `/bikes/${model.model_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`
    }));

    return NextResponse.json({
      success: true,
      data: formattedModels
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}