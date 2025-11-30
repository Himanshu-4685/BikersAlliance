import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 });
    }

    // Validate files
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    
    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json({
          success: false,
          error: `File ${file.name} is too large. Maximum size is 5MB.`
        }, { status: 400 });
      }
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
          success: false,
          error: `File ${file.name} has invalid type. Only JPEG, PNG, WebP, and AVIF are allowed.`
        }, { status: 400 });
      }
    }

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `sell-bikes/${fileName}`;

      const { data, error } = await supabase.storage
        .from('sell-bikes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload ${file.name}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sell-bikes')
        .getPublicUrl(filePath);

      return {
        fileName: file.name,
        path: filePath,
        url: publicUrl
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} file(s)`,
      data: uploadResults
    });

  } catch (err) {
    console.error('API /upload/sell-bike-images error:', err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({
        success: false,
        error: 'File path is required'
      }, { status: 400 });
    }

    const { error } = await supabase.storage
      .from('sell-bikes')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete file'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (err) {
    console.error('API /upload/sell-bike-images DELETE error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error'
    }, { status: 500 });
  }
}