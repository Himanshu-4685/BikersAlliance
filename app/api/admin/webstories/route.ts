import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { title, slug, cover_image_url, pages, author, published_at, is_published } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'title and slug are required' }, { status: 400 });
    }

    const pagesJson = pages && Array.isArray(pages) ? pages : null;

    const insertData = {
      title,
      slug,
      cover_image_url: cover_image_url || null,
      pages: pagesJson,
      author: author || null,
      published_at: published_at || null,
      is_published: is_published || false
    };

    const { data, error } = await (supabase as any)
      .from('web_stories')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting web story:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API /admin/webstories error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
