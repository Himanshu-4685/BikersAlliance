import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables', { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey });
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('API called with params:', { statusFilter, limit });

    // First, let's try a simple query to see if the table exists and has data
    let query = supabase
      .from('status')
      .select('*')
      .limit(limit);

    // Filter by status if provided
    if (statusFilter && (statusFilter === 'upcoming' || statusFilter === 'new_launch')) {
      query = query.eq('status', statusFilter);
    }

    const { data: statusData, error: statusError } = await query;

    if (statusError) {
      console.error('Error fetching status data:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch bike status', details: statusError.message },
        { status: 500 }
      );
    }

    if (!statusData || statusData.length === 0) {
      console.log('No status data found');
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No bikes found for the specified status'
      });
    }

    console.log('Found status data:', statusData.length, 'records');

    // Now fetch related data for each status record
    const enrichedData = await Promise.all(
      statusData.map(async (statusItem: any) => {
        try {
          // Fetch brand data
          const { data: brandData } = await supabase
            .from('brands')
            .select('brand_id, brand_name, logo_url')
            .eq('brand_id', statusItem.brand_id)
            .single();

          // Fetch model data
          const { data: modelData } = await supabase
            .from('models')
            .select('model_id, model_name')
            .eq('model_id', statusItem.model_id)
            .single();

          // Fetch variant data
          const { data: variantData } = await supabase
            .from('variants')
            .select('variant_id, variant_name, on_road_price, url')
            .eq('variant_id', statusItem.variant_id)
            .single();

          // Fetch images for this variant
          const { data: imagesData } = await supabase
            .from('images')
            .select('image_id, url, alt_text')
            .eq('variant_id', statusItem.variant_id);

          // Fetch specs for this variant (only for new_launch status)
          let specsData = null;
          if (statusItem.status === 'new_launch') {
            const { data: specs } = await supabase
              .from('specs')
              .select('engine_type, displacement, peak_power, city_mileage, highway_mileage, body_type, transmission, max_torque')
              .eq('variant_id', statusItem.variant_id)
              .single();
            specsData = specs;
          }

          return {
            id: statusItem.status_id,
            status: statusItem.status,
            priceRange: statusItem.price_range,
            expectedLaunch: statusItem.expected_launch,
            launchDate: statusItem.launch_date,
            brand: {
              id: brandData?.brand_id || null,
              name: brandData?.brand_name || 'Unknown Brand',
              logo: brandData?.logo_url || '/demo.avif'
            },
            model: {
              id: modelData?.model_id || null,
              name: modelData?.model_name || 'Unknown Model'
            },
            variant: {
              id: variantData?.variant_id || null,
              name: variantData?.variant_name || 'Unknown Variant',
              onRoadPrice: variantData?.on_road_price || null,
              slug: variantData?.url || (variantData?.variant_name ? variantData.variant_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : `bike-${statusItem.variant_id}`),
              images: imagesData || [],
              specs: specsData
            }
          };
        } catch (itemError) {
          console.error('Error processing status item:', itemError);
          // Return a fallback item
          return {
            id: statusItem.status_id,
            status: statusItem.status,
            priceRange: statusItem.price_range,
            expectedLaunch: statusItem.expected_launch,
            launchDate: statusItem.launch_date,
            brand: { id: null, name: 'Unknown Brand', logo: '/demo.avif' },
            model: { id: null, name: 'Unknown Model' },
            variant: {
              id: statusItem.variant_id,
              name: 'Unknown Variant',
              onRoadPrice: null,
              slug: `bike-${statusItem.variant_id}`,
              images: [],
              specs: null
            }
          };
        }
      })
    );

    console.log('Successfully enriched data for', enrichedData.length, 'bikes');

    return NextResponse.json({
      success: true,
      data: enrichedData,
      count: enrichedData.length
    });

  } catch (error) {
    console.error('Unexpected error in bike-status API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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

    const insertData: any = {
      brand_id,
      model_id,
      variant_id,
      status,
      price_range,
      updated_at: new Date().toISOString()
    };

    if (status === 'upcoming' && expected_launch) {
      insertData.expected_launch = expected_launch;
    }

    if (status === 'new_launch' && launch_date) {
      insertData.launch_date = launch_date;
    }

    const { data, error } = await supabase
      .from('status')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating bike status:', error);
      return NextResponse.json(
        { error: 'Failed to create bike status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Bike status created successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}