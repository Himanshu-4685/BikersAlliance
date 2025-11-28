import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { title, slug, excerpt, content, cover_image_url, author, published_at, is_published, category, featured } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    // Check if slug already exists
    const { data: existingNews } = await (supabase as any)
      .from('news')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingNews) {
      return NextResponse.json({ success: false, error: 'A news item with this slug already exists' }, { status: 400 });
    }

    const insertData = {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      cover_image_url: cover_image_url || null,
      author: author || 'BikersAlliance Editorial',
      published_at: published_at || new Date().toISOString(),
      is_published: is_published !== undefined ? is_published : true,
      category: category || 'General',
      featured: featured || false
    };

    const { data, error } = await (supabase as any)
      .from('news')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting news:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to create news item' 
      }, { status: 500 });
    }

    console.log('News created successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'News item created successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/news error:', err);
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
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching news:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('API /admin/news GET error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
