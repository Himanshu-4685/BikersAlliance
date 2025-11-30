import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { title, slug, description, video_url, thumbnail_url, source, published_at, is_published, category, featured, duration, views } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    // Check if slug already exists
    const { data: existingVideo } = await (supabase as any)
      .from('videos')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingVideo) {
      return NextResponse.json({ success: false, error: 'A video with this slug already exists' }, { status: 400 });
    }

    const insertData = {
      title,
      slug,
      description: description || null,
      video_url: video_url || null,
      thumbnail_url: thumbnail_url || null,
      source: source || 'YouTube',
      published_at: published_at || new Date().toISOString(),
      is_published: is_published !== undefined ? is_published : true,
      category: category || 'General',
      featured: featured || false,
      duration: duration || '0:00',
      views: views || '0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from('videos')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting video:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to create video' 
      }, { status: 500 });
    }

    console.log('Video created successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Video created successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/videos error:', err);
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
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching videos:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('API /admin/videos GET error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
