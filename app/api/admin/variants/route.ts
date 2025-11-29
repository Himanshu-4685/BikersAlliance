import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - List variants with pagination and search
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const modelId = searchParams.get('modelId') || '';
    const brandId = searchParams.get('brandId') || '';
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        model_id,
        brand_id,
        on_road_price,
        created_at,
        url,
        models!inner(
          model_name
        ),
        brands!inner(
          brand_name
        )
      `);

    // Add search filter
    if (search) {
      query = query.or(`variant_name.ilike.%${search}%`);
    }

    // Add model filter
    if (modelId) {
      query = query.eq('model_id', modelId);
    }

    // Add brand filter
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    // Get total count
    const { count } = await supabase
      .from('variants')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: variants, error } = await query
      .order('variant_id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Format variants data with model and brand names
    const formattedVariants = (variants || []).map((variant: any) => ({
      variant_id: variant.variant_id,
      variant_name: variant.variant_name,
      model_id: variant.model_id,
      brand_id: variant.brand_id,
      model_name: variant.models?.model_name,
      brand_name: variant.brands?.brand_name,
      on_road_price: variant.on_road_price,
      mileage: variant.mileage,
      engine_capacity: variant.engine_capacity,
      created_at: variant.created_at
    }));

    return NextResponse.json({
      success: true,
      variants: formattedVariants,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Variants API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new variant
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      variant_id,
      variant_name, 
      model_id, 
      brand_id, 
      on_road_price 
    } = body;

    if (!variant_name || !model_id || !brand_id) {
      return NextResponse.json(
        { success: false, error: 'Variant name, model, and brand are required' },
        { status: 400 }
      );
    }

    // Validate variant_id if provided
    if (variant_id && (isNaN(Number(variant_id)) || Number(variant_id) <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Variant ID must be a positive number' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    let variant;
    let error;

    // Function to find next available ID
    const findNextAvailableId = async (startId: number = 578): Promise<number> => {
      let currentId = startId;
      while (currentId <= startId + 1000) { // Safety limit
        const { data: existing } = await supabase
          .from('variants')
          .select('variant_id')
          .eq('variant_id', currentId)
          .single();
        
        if (!existing) {
          return currentId;
        }
        currentId++;
      }
      throw new Error('Could not find available ID');
    };

    // If variant_id is provided, use it directly
    if (variant_id) {
      // Check if the ID already exists
      const { data: existingVariant } = await supabase
        .from('variants')
        .select('variant_id')
        .eq('variant_id', variant_id)
        .single();
      
      if (existingVariant) {
        return NextResponse.json(
          { success: false, error: `Variant ID ${variant_id} already exists` },
          { status: 400 }
        );
      }

      const insertResult = await (supabase as any)
        .from('variants')
        .insert({
          variant_id: Number(variant_id),
          variant_name,
          model_id,
          brand_id,
          on_road_price
        })
        .select()
        .single();

      variant = insertResult.data;
      error = insertResult.error;
    } else {
      // Auto-generate ID - find next available ID starting from 578
      try {
        const nextId = await findNextAvailableId(578);
        
        const insertResult = await (supabase as any)
          .from('variants')
          .insert({
            variant_id: nextId,
            variant_name,
            model_id,
            brand_id,
            on_road_price
          })
          .select()
          .single();

        variant = insertResult.data;
        error = insertResult.error;
      } catch (findIdError) {
        console.error('Error finding next ID:', findIdError);
        return NextResponse.json(
          { success: false, error: 'Could not generate variant ID' },
          { status: 500 }
        );
      }
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create variant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      variant
    });

  } catch (error) {
    console.error('Variants API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}