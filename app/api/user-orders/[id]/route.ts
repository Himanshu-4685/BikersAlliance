import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { user_id } = await request.json();

    if (!orderId || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Order ID and User ID are required' },
        { status: 400 }
      );
    }

    console.log('DELETE /api/user-orders/[id] - Request:', { orderId, user_id });

    // Delete the order (only if it belongs to the user)
    const { error } = await supabase
      .from('user_orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user_id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}