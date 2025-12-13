import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch a specific dealer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealerId = parseInt(params.id);

    if (isNaN(dealerId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid dealer ID' 
        },
        { status: 400 }
      );
    }

    const { data: dealer, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('dealer_id', dealerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Dealer not found' 
          },
          { status: 404 }
        );
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch dealer',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealer
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update a dealer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealerId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(dealerId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid dealer ID' 
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const { name, city, state } = body;
    
    if (!name || !city || !state) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, city, and state are required' 
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid email format' 
          },
          { status: 400 }
        );
      }
    }

    const { data: dealer, error } = await supabase
      .from('dealers')
      .update({
        name: name.trim(),
        address: body.address?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        pincode: body.pincode?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email?.trim().toLowerCase() || null
      })
      .eq('dealer_id', dealerId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Dealer not found' 
          },
          { status: 404 }
        );
      }

      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update dealer',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealer,
      message: 'Dealer updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a dealer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealerId = parseInt(params.id);

    if (isNaN(dealerId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid dealer ID' 
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('dealers')
      .delete()
      .eq('dealer_id', dealerId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete dealer',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dealer deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}