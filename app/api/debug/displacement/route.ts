"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Get some sample displacement data to see format
    const { data: specs, error } = await supabase
      .from('specs')
      .select('displacement')
      .not('displacement', 'is', null)
      .not('displacement', 'eq', '')
      .limit(20);

    if (error) {
      throw error;
    }

    // Also get some specific high displacement bikes
    const { data: highDisplacement, error: highError } = await supabase
      .from('specs')
      .select('displacement')
      .or('displacement.ilike.%1000%,displacement.ilike.%900%,displacement.ilike.%800%,displacement.ilike.%700%,displacement.ilike.%600%')
      .limit(10);

    if (highError) {
      console.error('High displacement query error:', highError);
    }

    // Test numeric queries
    const { data: numericTest, error: numericError } = await supabase
      .from('specs')
      .select('displacement')
      .gte('displacement', 500)
      .limit(10);

    if (numericError) {
      console.error('Numeric query error:', numericError);
    }

    return NextResponse.json({
      allDisplacements: specs?.map((s: any) => s.displacement) || [],
      highDisplacements: highDisplacement?.map((s: any) => s.displacement) || [],
      numericQueryResults: numericTest?.map((s: any) => s.displacement) || [],
      numericQueryError: numericError?.message || null
    });

  } catch (error) {
    console.error('Debug displacement error:', error);
    return NextResponse.json(
      { error: 'Failed to debug displacement data' },
      { status: 500 }
    );
  }
}