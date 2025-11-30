import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Check for common single-word body types
    const commonTypes = ['Scooter', 'Sports', 'Commuter', 'Cruiser', 'Electric'];
    const results: any = {};

    for (const type of commonTypes) {
      const { data, error } = await supabase
        .from('specs')
        .select('body_type')
        .eq('body_type', type)
        .limit(1);
      
      if (data && data.length > 0) {
        results[type] = 'exists';
      } else {
        results[type] = 'not found';
      }
    }

    // Also check for "X Bikes" versions
    const bikesTypes = ['Scooter Bikes', 'Sports Bikes', 'Commuter Bikes', 'Cruiser Bikes'];
    for (const type of bikesTypes) {
      const { data, error } = await supabase
        .from('specs')
        .select('body_type')
        .eq('body_type', type)
        .limit(1);
      
      if (data && data.length > 0) {
        results[type] = 'exists';
      } else {
        results[type] = 'not found';
      }
    }

    return NextResponse.json({
      bodyTypeCheck: results,
      message: 'Checking exact matches for common body types'
    });

  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}