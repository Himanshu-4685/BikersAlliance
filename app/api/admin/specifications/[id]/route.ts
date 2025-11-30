import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - Get single specification
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

    const { data: spec, error } = await supabase
      .from('specs')
      .select('*')
      .eq('variant_id', variantId)
      .single();

    if (error || !spec) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Specification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      specification: spec
    });

  } catch (error) {
    console.error('Specification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update specification
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

    const supabase = createServerClient();

    // Update specification
    const { data: updatedSpec, error } = await (supabase as any)
      .from('specs')
      .update(body)
      .eq('variant_id', variantId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update specification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      specification: updatedSpec
    });

  } catch (error) {
    console.error('Update specification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specification
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

    // Delete specification
    const { error } = await supabase
      .from('specs')
      .delete()
      .eq('variant_id', variantId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete specification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Specification deleted successfully'
    });

  } catch (error) {
    console.error('Delete specification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}