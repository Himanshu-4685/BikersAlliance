import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get all unique body types from the database
    const { data: bodyTypes, error } = await supabase
      .from('specs')
      .select('body_type')
      .not('body_type', 'is', null)
      .not('body_type', 'eq', '');

    if (error) {
      throw error;
    }

    const bodyTypeValues = bodyTypes?.map((spec: any) => spec.body_type).filter(Boolean) || [];
    const uniqueBodyTypes = Array.from(new Set(bodyTypeValues));
    
    console.log('All body types in database:', uniqueBodyTypes);

    // Also check what bikes have "roadster" in their body type
    const { data: roadsterBikes, error: roadsterError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        specs(body_type)
      `)
      .ilike('specs.body_type', '%roadster%')
      .limit(5);

    console.log('Bikes with roadster in body type:', roadsterBikes);

    return NextResponse.json({
      allBodyTypes: uniqueBodyTypes.sort(),
      total: uniqueBodyTypes.length,
      roadsterBikes: roadsterBikes,
      roadsterError: roadsterError
    });

  } catch (error) {
    console.error('Error fetching body types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch body types' },
      { status: 500 }
    );
  }
}