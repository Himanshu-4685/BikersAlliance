import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - Get single variant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const variantId = params.id;

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: variant, error } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        model_id,
        brand_id,
        on_road_price,
        models!inner(
          model_name
        ),
        brands!inner(
          brand_name
        )
      `)
      .eq('variant_id', variantId)
      .single();

    if (error || !variant) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    const variantWithDetails = {
      variant_id: (variant as any).variant_id,
      variant_name: (variant as any).variant_name,
      model_id: (variant as any).model_id,
      brand_id: (variant as any).brand_id,
      model_name: (variant as any).models?.model_name,
      brand_name: (variant as any).brands?.brand_name,
      on_road_price: (variant as any).on_road_price
    };

    return NextResponse.json({
      success: true,
      variant: variantWithDetails
    });

  } catch (error) {
    console.error('Variant API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update variant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const variantId = params.id;

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { variant_name, model_id, brand_id, on_road_price } = body;

    if (!variant_name || !model_id || !brand_id) {
      return NextResponse.json(
        { success: false, error: 'Variant name, model, and brand are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if variant exists
    const { data: existingVariant } = await supabase
      .from('variants')
      .select('variant_id')
      .eq('variant_id', variantId)
      .single();

    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Update variant
    const { data: updatedVariant, error } = await (supabase as any)
      .from('variants')
      .update({
        variant_name,
        model_id,
        brand_id,
        on_road_price
      })
      .eq('variant_id', variantId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update variant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      variant: updatedVariant
    });

  } catch (error) {
    console.error('Update variant error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const variantId = params.id;

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if variant exists
    const { data: existingVariant } = await supabase
      .from('variants')
      .select('variant_id, variant_name')
      .eq('variant_id', variantId)
      .single();

    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Delete variant
    const { error } = await supabase
      .from('variants')
      .delete()
      .eq('variant_id', variantId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete variant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Variant deleted successfully'
    });

  } catch (error) {
    console.error('Delete variant error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}