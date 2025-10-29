import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();

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
    
    // Format as simple text list for easy reading
    const formattedList = uniqueBodyTypes.sort().map((type, index) => `${index + 1}. ${type}`).join('\n');

    return new Response(formattedList, {
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}