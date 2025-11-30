import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const variantId = formData.get('variantId') as string;

    if (!file || !variantId) {
      return NextResponse.json(
        { success: false, error: 'Image file and variant ID are required' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload JPEG, PNG, WebP, or AVIF images.' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if variant exists
    const { data: variant, error: variantError } = await supabase
      .from('variants')
      .select('variant_id, variant_name')
      .eq('variant_id', parseInt(variantId))
      .single();

    if (variantError || !variant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${variantId}.avif`;
    const filePath = `Image/Variant_image/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Bikeralliance')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Generate the public URL
    const imageUrl = `https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/${filePath}`;

    // Check if image entry already exists
    const { data: existingImage } = await supabase
      .from('images')
      .select('image_id')
      .eq('image_id', parseInt(variantId))
      .single();

    if (existingImage) {
      // Update existing image entry
      const { error: updateError } = await (supabase as any)
        .from('images')
        .update({ 
          url: imageUrl,
          alt_text: `${(variant as any).variant_name || 'Variant'} Image`
        })
        .eq('image_id', parseInt(variantId));

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update image record' },
          { status: 500 }
        );
      }
    } else {
      // Insert new image entry
      const { error: insertError } = await (supabase as any)
        .from('images')
        .insert({
          image_id: parseInt(variantId),
          variant_id: parseInt(variantId),
          url: imageUrl,
          alt_text: `Variant ${variantId} Image`
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to create image record' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload variant image error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}