import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - Get single status
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

    const statusId = params.id;

    if (!statusId) {
      return NextResponse.json(
        { success: false, error: 'Status ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: status, error } = await supabase
      .from('status')
      .select(`
        status_id,
        brand_id,
        model_id,
        variant_id,
        status,
        price_range,
        expected_launch,
        launch_date,
        brands!inner(
          brand_name
        ),
        models!inner(
          model_name
        ),
        variants!inner(
          variant_name
        )
      `)
      .eq('status_id', statusId)
      .single();

    if (error || !status) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: status
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update status
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

    const statusId = params.id;

    if (!statusId) {
      return NextResponse.json(
        { success: false, error: 'Status ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { brand_id, model_id, variant_id, status, price_range, expected_launch, launch_date } = body;

    if (!brand_id || !model_id || !variant_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Brand ID, Model ID, Variant ID and status are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Update status
    const { data: updatedStatus, error } = await (supabase as any)
      .from('status')
      .update({
        brand_id,
        model_id,
        variant_id,
        status,
        price_range,
        expected_launch,
        launch_date,
        updated_at: new Date().toISOString()
      })
      .eq('status_id', statusId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: updatedStatus
    });

  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete status
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

    const statusId = params.id;

    if (!statusId) {
      return NextResponse.json(
        { success: false, error: 'Status ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Delete status
    const { error } = await supabase
      .from('status')
      .delete()
      .eq('status_id', statusId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status deleted successfully'
    });

  } catch (error) {
    console.error('Delete status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}