import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Search for bikes with "Roadster Bikes" body type
    const { data: roadsterBikes, error } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        specs!inner(body_type)
      `)
      .eq('specs.body_type', 'Roadster Bikes')
      .limit(10);

    // Also search with ILIKE
    const { data: roadsterBikesIlike, error: roadsterErrorIlike } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        specs(body_type)
      `)
      .ilike('specs.body_type', '%Roadster Bikes%')
      .limit(10);

    // Check if there are bikes with "roadster" in the body type (case insensitive)
    const { data: roadsterAny, error: roadsterAnyError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        specs(body_type)
      `)
      .ilike('specs.body_type', '%roadster%')
      .limit(10);

    console.log('Exact match results:', roadsterBikes);
    console.log('ILIKE results:', roadsterBikesIlike);
    console.log('Any roadster results:', roadsterAny);

    return NextResponse.json({
      exactMatch: roadsterBikes,
      exactError: error,
      ilikeMatch: roadsterBikesIlike,
      ilikeError: roadsterErrorIlike,
      anyRoadster: roadsterAny,
      anyError: roadsterAnyError
    });

  } catch (error) {
    console.error('Error in roadster debug:', error);
    return NextResponse.json(
      { error: 'Failed to debug roadster' },
      { status: 500 }
    );
  }
}