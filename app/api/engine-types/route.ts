"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get all unique engine types with counts
    const { data, error } = await supabase
      .from('specs')
      .select('engine_type')
      .not('engine_type', 'is', null);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Process the engine types and categorize them
    const engineTypeCounts: { [key: string]: number } = {};
    
    (data || []).forEach((item: any) => {
      const engineType = item.engine_type?.toLowerCase() || '';
      
      // Categorize based on patterns in the engine_type field
      if (engineType.includes('4-stroke') || engineType.includes('4 stroke')) {
        engineTypeCounts['4-stroke'] = (engineTypeCounts['4-stroke'] || 0) + 1;
      }
      if (engineType.includes('2-stroke') || engineType.includes('2 stroke')) {
        engineTypeCounts['2-stroke'] = (engineTypeCounts['2-stroke'] || 0) + 1;
      }
      if (engineType.includes('electric')) {
        engineTypeCounts['electric'] = (engineTypeCounts['electric'] || 0) + 1;
      }
      if (engineType.includes('single cylinder') || engineType.includes('single-cylinder')) {
        engineTypeCounts['single-cylinder'] = (engineTypeCounts['single-cylinder'] || 0) + 1;
      }
      if (engineType.includes('multi') || engineType.includes('twin') || engineType.includes('triple') || engineType.includes('four')) {
        engineTypeCounts['multi-cylinder'] = (engineTypeCounts['multi-cylinder'] || 0) + 1;
      }
    });

    // Create the response with formatted engine types
    const engineTypes = [
      {
        id: '4-stroke',
        name: '4-Stroke',
        slug: '4-stroke',
        count: engineTypeCounts['4-stroke'] || 0
      },
      {
        id: '2-stroke', 
        name: '2-Stroke',
        slug: '2-stroke',
        count: engineTypeCounts['2-stroke'] || 0
      },
      {
        id: 'electric',
        name: 'Electric',
        slug: 'electric', 
        count: engineTypeCounts['electric'] || 0
      },
      {
        id: 'single-cylinder',
        name: 'Single Cylinder',
        slug: 'single-cylinder',
        count: engineTypeCounts['single-cylinder'] || 0
      },
      {
        id: 'multi-cylinder',
        name: 'Multi Cylinder', 
        slug: 'multi-cylinder',
        count: engineTypeCounts['multi-cylinder'] || 0
      }
    ];

    return NextResponse.json({
      engineTypes: engineTypes.filter(type => type.count > 0), // Only return types that have bikes
      total: engineTypes.reduce((sum, type) => sum + type.count, 0)
    });

  } catch (error) {
    console.error('Error fetching engine types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engine types' },
      { status: 500 }
    );
  }
}