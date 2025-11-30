import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Check the specific TVS XL100 bikes to see their body types
    const { data: tvsBikes, error } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        specs(body_type)
      `)
      .ilike('variant_name', '%TVS XL100%')
      .limit(10);

    console.log('TVS XL100 bikes and their body types:', tvsBikes);

    return NextResponse.json({
      tvsBikes: tvsBikes,
      error: error
    });

  } catch (error) {
    console.error('Error fetching TVS bikes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TVS bikes' },
      { status: 500 }
    );
  }
}