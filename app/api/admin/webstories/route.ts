import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { title, slug, cover_image_url, pages, author, published_at, is_published, category, featured, description } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    // Check if slug already exists
    const { data: existingStory } = await (supabase as any)
      .from('web_stories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingStory) {
      return NextResponse.json({ success: false, error: 'A web story with this slug already exists' }, { status: 400 });
    }

    const pagesJson = pages && Array.isArray(pages) ? pages : [];

    const insertData = {
      title,
      slug,
      cover_image_url: cover_image_url || null,
      pages: pagesJson,
      author: author || 'BikersAlliance Editorial',
      published_at: published_at || new Date().toISOString(),
      is_published: is_published !== undefined ? is_published : true,
      category: category || 'General',
      featured: featured || false,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from('web_stories')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting web story:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to create web story' 
      }, { status: 500 });
    }

    console.log('Web story created successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Web story created successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/webstories error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await (supabase as any)
      .from('web_stories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching web stories:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('API /admin/webstories GET error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
