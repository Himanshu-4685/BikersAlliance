import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const statusId = parseInt(params.id);

    if (isNaN(statusId)) {
      return NextResponse.json(
        { error: 'Invalid status ID' },
        { status: 400 }
      );
    }

    const { brand_id, model_id, variant_id, status, price_range, expected_launch, launch_date } = body;

    // Validation
    if (!brand_id || !model_id || !variant_id || !status || !price_range) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['upcoming', 'new_launch'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "upcoming" or "new_launch"' },
        { status: 400 }
      );
    }

    const updateData: any = {
      brand_id,
      model_id,
      variant_id,
      status,
      price_range,
      updated_at: new Date().toISOString()
    };

    if (status === 'upcoming' && expected_launch) {
      updateData.expected_launch = expected_launch;
      updateData.launch_date = null; // Clear launch_date for upcoming bikes
    }

    if (status === 'new_launch' && launch_date) {
      updateData.launch_date = launch_date;
      updateData.expected_launch = null; // Clear expected_launch for launched bikes
    }

    const { data, error } = await supabase
      .from('status')
      .update(updateData)
      .eq('status_id', statusId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bike status:', error);
      return NextResponse.json(
        { error: 'Failed to update bike status' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Bike status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Bike status updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const statusId = parseInt(params.id);

    if (isNaN(statusId)) {
      return NextResponse.json(
        { error: 'Invalid status ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('status')
      .delete()
      .eq('status_id', statusId);

    if (error) {
      console.error('Error deleting bike status:', error);
      return NextResponse.json(
        { error: 'Failed to delete bike status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bike status deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const statusId = parseInt(params.id);

    if (isNaN(statusId)) {
      return NextResponse.json(
        { error: 'Invalid status ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('status')
      .select(`
        status_id,
        status,
        price_range,
        expected_launch,
        launch_date,
        brands:brand_id (
          brand_id,
          brand_name,
          logo_url
        ),
        models:model_id (
          model_id,
          model_name
        ),
        variants:variant_id (
          variant_id,
          variant_name,
          on_road_price,
          url,
          images (
            image_id,
            url,
            alt_text
          ),
          specs (
            engine_type,
            displacement,
            peak_power,
            city_mileage,
            highway_mileage,
            body_type,
            transmission,
            max_torque
          )
        )
      `)
      .eq('status_id', statusId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Bike status not found' },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedData = {
      id: (data as any).status_id,
      status: (data as any).status,
      priceRange: (data as any).price_range,
      expectedLaunch: (data as any).expected_launch,
      launchDate: (data as any).launch_date,
      brand: {
        id: (data as any).brands?.brand_id,
        name: (data as any).brands?.brand_name,
        logo: (data as any).brands?.logo_url
      },
      model: {
        id: (data as any).models?.model_id,
        name: (data as any).models?.model_name
      },
      variant: {
        id: (data as any).variants?.variant_id,
        name: (data as any).variants?.variant_name,
        onRoadPrice: (data as any).variants?.on_road_price,
        slug: (data as any).variants?.url,
        images: (data as any).variants?.images || [],
        specs: (data as any).variants?.specs?.[0] || null
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}