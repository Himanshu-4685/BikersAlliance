"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();

    // Get all unique body types from specs table
    const { data: bodyTypes, error } = await supabase
      .from('specs')
      .select('body_type')
      .not('body_type', 'is', null)
      .not('body_type', 'eq', '');

    if (error) {
      throw error;
    }

    // Get unique body types and count bikes for each
    const bodyTypeValues = bodyTypes?.map((spec: any) => spec.body_type).filter(Boolean) || [];
    const uniqueBodyTypes = Array.from(new Set(bodyTypeValues));
    
    const bodyTypeData = await Promise.all(
      uniqueBodyTypes.map(async (bodyType) => {
        const { count, error: countError } = await supabase
          .from('specs')
          .select('variant_id', { count: 'exact', head: true })
          .eq('body_type', bodyType);

        if (countError) {
          console.error(`Error counting bikes for ${bodyType}:`, countError);
          return {
            name: bodyType,
            slug: bodyType.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            count: 0
          };
        }

        return {
          name: bodyType,
          slug: bodyType.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
          count: count || 0
        };
      })
    );

    // Sort by name
    bodyTypeData.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      bodyTypes: bodyTypeData,
      total: bodyTypeData.length
    });

  } catch (error) {
    console.error('Error fetching body types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch body types' },
      { status: 500 }
    );
  }
}