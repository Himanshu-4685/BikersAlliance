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
      .from('news')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API /admin/news/[id] GET error:', err);
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
    const { title, slug, excerpt, content, cover_image_url, author, is_published, category, featured } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    // Check if slug already exists (excluding current item)
    const { data: existingNews } = await (supabase as any)
      .from('news')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single();

    if (existingNews) {
      return NextResponse.json({ success: false, error: 'A news item with this slug already exists' }, { status: 400 });
    }

    const updateData = {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      cover_image_url: cover_image_url || null,
      author: author || 'BikersAlliance Editorial',
      is_published: is_published !== undefined ? is_published : true,
      category: category || 'General',
      featured: featured || false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from('news')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating news:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to update news item' 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'News item not found' }, { status: 404 });
    }

    console.log('News updated successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'News item updated successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/news/[id] PATCH error:', err);
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
      .from('news')
      .delete()
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error deleting news:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to delete news item' 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'News item not found' }, { status: 404 });
    }

    console.log('News deleted successfully:', data);
    return NextResponse.json({ 
      success: true, 
      message: 'News item deleted successfully!',
      data 
    });
  } catch (err) {
    console.error('API /admin/news/[id] DELETE error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error. Please try again.' 
    }, { status: 500 });
  }
}