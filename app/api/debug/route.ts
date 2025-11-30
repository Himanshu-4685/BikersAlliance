"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Test 1: Check what body_type values exist
    const { data: bodyTypes, error: bodyTypesError } = await supabase
      .from('specs')
      .select('body_type')
      .not('body_type', 'is', null);

    // Test 2: Simple variants query
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select('variant_id, variant_name')
      .limit(5);

    // Test 3: Simple specs query
    const { data: specs, error: specsError } = await supabase
      .from('specs')
      .select('variant_id, body_type, displacement, peak_power, city_mileage')
      .limit(5);

    // Test 4: Try the join query
    const { data: joinData, error: joinError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        specs!left(body_type, displacement, peak_power, city_mileage)
      `)
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        bodyTypes: {
          data: bodyTypes,
          error: bodyTypesError,
          unique: Array.from(new Set(bodyTypes?.map((item: any) => item.body_type))).filter(Boolean)
        },
        variants: {
          data: variants,
          error: variantsError
        },
        specs: {
          data: specs,
          error: specsError
        },
        joinData: {
          data: joinData,
          error: joinError
        }
      }
    });

  } catch (error: any) {
    console.error('Debug test error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}