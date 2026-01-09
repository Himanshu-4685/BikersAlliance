import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

interface BestBike {
  variant_id: number;
  brand_name: string;
  model_name: string;
  variant_name: string;
  on_road_price: number;
  displacement: string;
  city_mileage: string;
  image_url?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Use the provided SQL query but convert it to Supabase syntax
    const { data: bikes, error } = await supabase
      .rpc('get_best_bikes')
      .returns<BestBike[]>();

    // If the RPC function doesn't exist, fall back to a regular query
    if (error && error.message?.includes('function')) {
      console.log('RPC function not found, using regular query...');
      
      // Alternative approach using regular Supabase query
      const { data: bikesData, error: queryError } = await supabase
        .from('variants')
        .select(`
          variant_id,
          brands!inner(brand_name),
          models!inner(model_name),
          variant_name,
          on_road_price,
          specs!inner(displacement, city_mileage),
          images(url)
        `)
        .gte('on_road_price', 200000)
        .lte('on_road_price', 300000)
        .order('on_road_price', { ascending: true });

      if (queryError) {
        console.error('Query error:', queryError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch bikes data' },
          { status: 500 }
        );
      }

      // Filter and process the data
      const processedBikes = (bikesData as any[])
        ?.filter((bike: any) => {
          const displacement = bike.specs?.displacement;
          const mileage = bike.specs?.city_mileage;
          
          if (!displacement || !mileage) return false;
          
          // Extract numeric values from displacement and mileage strings
          // Handle both integers and decimal numbers
          const displacementMatch = displacement.match(/(\d+(?:\.\d+)?)/);
          const mileageMatch = mileage.match(/(\d+(?:\.\d+)?)/);
          
          if (!displacementMatch || !mileageMatch) return false;
          
          const displacementNum = parseFloat(displacementMatch[1]);
          const mileageNum = parseFloat(mileageMatch[1]);
          
          return displacementNum >= 250 && 
                 displacementNum <= 350 && 
                 mileageNum > 40;
        })
        .map((bike: any) => ({
          variant_id: bike.variant_id,
          brand_name: bike.brands?.brand_name || '',
          model_name: bike.models?.model_name || '',
          variant_name: bike.variant_name || '',
          on_road_price: bike.on_road_price || 0,
          displacement: bike.specs?.displacement || '',
          city_mileage: bike.specs?.city_mileage || '',
          image_url: bike.images?.[0]?.url || null
        })) || [];

      return NextResponse.json({
        success: true,
        data: processedBikes,
        total: processedBikes.length,
        criteria: {
          priceRange: '₹2,00,000 - ₹3,00,000',
          displacement: '250cc - 350cc',
          minMileage: '40+ kmpl'
        }
      });
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch best bikes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (bikes as BestBike[]) || [],
      total: (bikes as BestBike[])?.length || 0,
      criteria: {
        priceRange: '₹2,00,000 - ₹3,00,000',
        displacement: '250cc - 350cc',
        minMileage: '40+ kmpl'
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}