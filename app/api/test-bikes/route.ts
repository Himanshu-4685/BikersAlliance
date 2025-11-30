import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Just return a test response to see if the basic route works
    return NextResponse.json({
      bikes: [],
      bodyType: {
        name: "Test",
        slug: "test"
      },
      pagination: {
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json(
      { error: 'Test route failed' },
      { status: 500 }
    );
  }
}