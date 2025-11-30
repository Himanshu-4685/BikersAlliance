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
      .from('web_stories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Web story not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API /admin/webstories/[id] GET error:', err);
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
    const { title, slug, cover_image_url, pages, author, is_published, category, featured, description } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    // Check if slug already exists (excluding current item)
    const { data: existingStory } = await (supabase as any)
      .from('web_stories')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single();

    if (existingStory) {
      return NextResponse.json({ success: false, error: 'A web story with this slug already exists' }, { status: 400 });
    }

    const pagesJson = pages && Array.isArray(pages) ? pages : [];

    const updateData = {
      title,
      slug,
      cover_image_url: cover_image_url || null,
      pages: pagesJson,
      author: author || 'BikersAlliance Editorial',
      is_published: is_published !== undefined ? is_published : true,
      category: category || 'General',
      featured: featured || false,
      description: description || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from('web_stories')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating web story:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to update web story' 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Web story not found' }, { status: 404 });
    }

    console.log('Web story updated successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Web story updated successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/webstories/[id] PATCH error:', err);
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
      .from('web_stories')
      .delete()
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error deleting web story:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to delete web story' 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Web story not found' }, { status: 404 });
    }

    console.log('Web story deleted successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'Web story deleted successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/webstories/[id] DELETE error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error. Please try again.' 
    }, { status: 500 });
  }
}