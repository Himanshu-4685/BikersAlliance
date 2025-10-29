import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Check for any body types containing "scooter"
    const { data: scooterTypes, error } = await supabase
      .from('specs')
      .select('body_type')
      .ilike('body_type', '%scooter%')
      .not('body_type', 'is', null);

    // Get some sample scooter bikes
    const { data: scooterBikes, error: scooterError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        specs(body_type)
      `)
      .ilike('variant_name', '%scooter%')
      .limit(10);

    const scooterTypeValues = scooterTypes?.map((s: any) => s.body_type) || [];
    const uniqueScooterTypes = Array.from(new Set(scooterTypeValues));

    return NextResponse.json({
      scooterBodyTypes: uniqueScooterTypes,
      sampleScooterBikes: scooterBikes,
      errors: { scooterTypes: error, scooterBikes: scooterError }
    });

  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}