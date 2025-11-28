import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await (supabase as any)
      .from('videos')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API /admin/videos/[id] GET error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { title, slug, description, video_url, thumbnail_url, source, is_published, category, featured, duration } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    // Check if slug already exists (excluding current item)
    const { data: existingVideo } = await (supabase as any)
      .from('videos')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single();

    if (existingVideo) {
      return NextResponse.json({ success: false, error: 'A video with this slug already exists' }, { status: 400 });
    }

    const updateData = {
      title,
      slug,
      description: description || null,
      video_url: video_url || null,
      thumbnail_url: thumbnail_url || null,
      source: source || 'YouTube',
      is_published: is_published !== undefined ? is_published : true,
      category: category || 'General',
      featured: featured || false,
      duration: duration || '0:00',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from('videos')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating video:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to update video' 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    console.log('Video updated successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Video updated successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/videos/[id] PATCH error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error. Please try again.' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await (supabase as any)
      .from('videos')
      .delete()
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error deleting video:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to delete video' 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    console.log('Video deleted successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Video deleted successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/videos/[id] DELETE error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error. Please try again.' 
    }, { status: 500 });
  }
}