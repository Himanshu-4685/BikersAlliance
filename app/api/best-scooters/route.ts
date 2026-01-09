import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

interface BestScooter {
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

    // Use the RPC function first, fallback to regular query
    const { data: scooters, error } = await supabase
      .rpc('get_best_scooters')
      .returns<BestScooter[]>();

    // If the RPC function doesn't exist, fall back to a regular query
    if (error && error.message?.includes('function')) {
      console.log('RPC function not found, using regular query...');
      
      // Scooter-specific criteria: Lower price range, smaller displacement, focus on fuel efficiency
      const { data: scootersData, error: queryError } = await supabase
        .from('variants')
        .select(`
          variant_id,
          brands!inner(brand_name),
          models!inner(model_name),
          variant_name,
          on_road_price,
          specs!inner(displacement, city_mileage, body_type),
          images(url)
        `)
        .gte('on_road_price', 50000)   // ₹50,000 minimum
        .lte('on_road_price', 150000)  // ₹1,50,000 maximum
        .order('on_road_price', { ascending: true });

      if (queryError) {
        console.error('Query error:', queryError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch scooters data' },
          { status: 500 }
        );
      }

      // Filter scooters based on criteria
      const processedScooters = (scootersData as any[])
        ?.filter((scooter: any) => {
          const displacement = scooter.specs?.displacement;
          const mileage = scooter.specs?.city_mileage;
          const bodyType = scooter.specs?.body_type;
          const modelName = scooter.models?.model_name?.toLowerCase() || '';
          const variantName = scooter.variant_name?.toLowerCase() || '';
          
          if (!displacement || !mileage) return false;
          
          // Extract numeric values from displacement and mileage strings
          const displacementMatch = displacement.match(/(\d+(?:\.\d+)?)/);
          const mileageMatch = mileage.match(/(\d+(?:\.\d+)?)/);
          
          if (!displacementMatch || !mileageMatch) return false;
          
          const displacementNum = parseFloat(displacementMatch[1]);
          const mileageNum = parseFloat(mileageMatch[1]);
          
          // Strict scooter identification
          const isScooter = bodyType?.toLowerCase().includes('scooter') ||
                           bodyType?.toLowerCase().includes('moped') ||
                           modelName.includes('activa') ||
                           modelName.includes('access') ||
                           modelName.includes('jupiter') ||
                           modelName.includes('ntorq') ||
                           modelName.includes('burgman') ||
                           modelName.includes('vespa') ||
                           modelName.includes('aprilia') ||
                           modelName.includes('iqube') ||
                           variantName.includes('scooter');
          
          // Exclude motorcycles and bikes
          const isMotorcycle = modelName.includes('sport') ||
                              modelName.includes('commuter') ||
                              modelName.includes('shine') ||
                              modelName.includes('deluxe') ||
                              bodyType?.toLowerCase().includes('commuter') ||
                              bodyType?.toLowerCase().includes('sport') ||
                              (displacementNum > 125 && !isScooter);
          
          // Scooter criteria: Must be identified as scooter, 50cc-150cc displacement, 45+ kmpl mileage
          return isScooter && 
                 !isMotorcycle &&
                 displacementNum >= 50 && 
                 displacementNum <= 150 && 
                 mileageNum >= 45;
        })
        .map((scooter: any) => ({
          variant_id: scooter.variant_id,
          brand_name: scooter.brands?.brand_name || '',
          model_name: scooter.models?.model_name || '',
          variant_name: scooter.variant_name || '',
          on_road_price: scooter.on_road_price || 0,
          displacement: scooter.specs?.displacement || '',
          city_mileage: scooter.specs?.city_mileage || '',
          image_url: scooter.images?.[0]?.url || null
        })) || [];

      return NextResponse.json({
        success: true,
        data: processedScooters,
        total: processedScooters.length,
        criteria: {
          priceRange: '₹50,000 - ₹1,50,000',
          displacement: '50cc - 150cc',
          minMileage: '45+ kmpl',
          category: 'Scooters & Mopeds'
        }
      });
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch best scooters' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (scooters as BestScooter[]) || [],
      total: (scooters as BestScooter[])?.length || 0,
      criteria: {
        priceRange: '₹50,000 - ₹1,50,000',
        displacement: '50cc - 150cc',
        minMileage: '45+ kmpl',
        category: 'Scooters & Mopeds'
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