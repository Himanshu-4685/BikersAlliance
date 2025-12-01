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

    // Format the response to match what the edit form expects
    const formattedStatus = {
      ...status,
      status_type: status.status,  // Map status to status_type for form compatibility
      brand_name: status.brands?.brand_name,
      model_name: status.models?.model_name,
      variant_name: status.variants?.variant_name
    };

    // Remove nested objects
    delete formattedStatus.brands;
    delete formattedStatus.models;
    delete formattedStatus.variants;

    return NextResponse.json({
      success: true,
      status: formattedStatus
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
    console.log('Received update data:', body);
    
    // Prioritize status_type over status field (status_type is what the form sends)
    const status = body.status_type || body.status;
    const { brand_id, model_id, variant_id, price_range, expected_launch, launch_date } = body;

    // Only require status field for validation
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Prepare update data, only including fields that are provided
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // Only add fields if they are provided
    if (brand_id) updateData.brand_id = brand_id;
    if (model_id) updateData.model_id = model_id;
    if (variant_id) updateData.variant_id = variant_id;
    if (price_range !== undefined) updateData.price_range = price_range || null;
    if (expected_launch !== undefined) updateData.expected_launch = expected_launch || null;
    if (launch_date !== undefined) updateData.launch_date = launch_date || null;

    console.log('Updating status with data:', updateData);

    // Update status
    const { data: updatedStatus, error } = await supabase
      .from('status')
      .update(updateData)
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