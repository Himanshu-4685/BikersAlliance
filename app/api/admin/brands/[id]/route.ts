import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - Get single brand
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

    const brandId = params.id;

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: brand, error } = await supabase
      .from('brands')
      .select(`
        brand_id,
        brand_name,
        logo_url,
        country,
        description,
        created_at,
        models (
          model_id,
          model_name
        )
      `)
      .eq('brand_id', brandId)
      .single();

    if (error || !brand) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    const brandWithCount = {
      brand_id: (brand as any).brand_id,
      brand_name: (brand as any).brand_name,
      logo_url: (brand as any).logo_url,
      country: (brand as any).country,
      description: (brand as any).description,
      created_at: (brand as any).created_at,
      models_count: (brand as any).models ? (brand as any).models.length : 0
    };

    return NextResponse.json({
      success: true,
      brand: brandWithCount
    });

  } catch (error) {
    console.error('Brand API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update brand
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
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const brandId = params.id;

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { brand_name, logo_url, country, description } = body;

    if (!brand_name) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if brand exists
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('brand_id')
      .eq('brand_id', brandId)
      .single();

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if another brand with the same name exists (excluding current brand)
    const { data: duplicateBrand } = await supabase
      .from('brands')
      .select('brand_id')
      .eq('brand_name', brand_name)
      .neq('brand_id', brandId)
      .single();

    if (duplicateBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand name already exists' },
        { status: 409 }
      );
    }

    // Update brand
    const { data: updatedBrand, error } = await (supabase as any)
      .from('brands')
      .update({
        brand_name,
        logo_url,
        country,
        description
      })
      .eq('brand_id', brandId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update brand' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: updatedBrand
    });

  } catch (error) {
    console.error('Update brand error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete brand
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
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const brandId = params.id;

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if brand exists
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('brand_id, brand_name')
      .eq('brand_id', brandId)
      .single();

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if brand has models
    const { data: models } = await supabase
      .from('models')
      .select('model_id')
      .eq('brand_id', brandId)
      .limit(1);

    if (models && models.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete brand with existing models' },
        { status: 409 }
      );
    }

    // Delete brand
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('brand_id', brandId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete brand' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    });

  } catch (error) {
    console.error('Delete brand error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}