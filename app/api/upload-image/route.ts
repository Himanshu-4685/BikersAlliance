import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const offerId = formData.get('offerId') as string;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return errorResponse('File must be an image', 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File size must be less than 5MB', 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomId}.${fileExtension}`;
    
    // Upload path in storage bucket
    const uploadPath = `Image/Bike Offers/${fileName}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Bikeralliance')
      .upload(uploadPath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return errorResponse('Failed to upload image to storage: ' + uploadError.message, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('Bikeralliance')
      .getPublicUrl(uploadPath);

    if (!publicUrlData.publicUrl) {
      return errorResponse('Failed to get public URL for uploaded image', 500);
    }

    console.log('Generated public URL:', publicUrlData.publicUrl); // Debug logging

    return successResponse({
      message: 'Image uploaded successfully',
      imageUrl: publicUrlData.publicUrl,
      uploadPath: uploadPath,
      fileName: fileName
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return errorResponse('Internal server error during image upload', 500);
  }
}

// Optional: Handle DELETE for removing images
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return errorResponse('No image path provided', 400);
    }

    // Remove from Supabase storage
    const { error: deleteError } = await supabase.storage
      .from('Bikeralliance')
      .remove([imagePath]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return errorResponse('Failed to delete image: ' + deleteError.message, 500);
    }

    return successResponse({
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return errorResponse('Internal server error during image deletion', 500);
  }
}