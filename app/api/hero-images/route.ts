import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    console.log('API: Attempting to fetch hero images...');
    
    // Use the correct path: Bikeralliance/Image/hero_section
    console.log('API: Trying correct path: Bikeralliance/Image/hero_section');
    
    const { data: files, error } = await supabase.storage
      .from('Bikeralliance')
      .list('Image/hero_section', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    console.log('API: Response for Bikeralliance/Image/hero_section:', { files, error });

    let heroImages: string[] = [];

    if (error) {
      console.log('API: Storage listing failed, error:', error);
      console.log('API: This might be due to bucket permissions - files may still be publicly accessible via direct URLs');
      
      // Even if listing fails due to permissions, we can still generate URLs for known files
      // Since your debug showed URL generation works fine
      const knownHeroFiles = [
        'Ampere-Magnus-Grand.avif',
        'Hero-Destini-110_Desktop_1686x548px.avif', 
        'kawa.jpg',
        'TVS XL100.avif',
        'Ultraviolette-X47-Crossover_Desktop_1686x548px.avif'
      ];
      
      console.log('API: Generating URLs for known hero files...');
      heroImages = knownHeroFiles.map(filename => {
        const { data } = supabase.storage
          .from('Bikeralliance')
          .getPublicUrl(`Image/hero_section/${filename}`);
        
        console.log(`API: Generated URL for ${filename}:`, data.publicUrl);
        return data.publicUrl;
      });
      
    } else if (files && Array.isArray(files) && files.length > 0) {
      console.log('API: Successfully listed files:', files);
      
      // Filter for image files
      const imageFiles = files.filter(file => {
        if (!file.name) return false;
        return /\.(jpg|jpeg|png|avif|webp)$/i.test(file.name);
      });

      console.log(`API: Found ${imageFiles.length} image files:`, imageFiles);

      if (imageFiles.length > 0) {
        heroImages = imageFiles.map(file => {
          const { data } = supabase.storage
            .from('Bikeralliance')
            .getPublicUrl(`Image/hero_section/${file.name}`);
          
          console.log(`API: Generated URL for ${file.name}:`, data.publicUrl);
          return data.publicUrl;
        });
      }
    } else {
      console.log('API: No files found in the hero_section folder');
    }

    return NextResponse.json({ 
      success: heroImages.length > 0,
      images: heroImages,
      count: heroImages.length,
      message: heroImages.length > 0 
        ? 'Successfully fetched hero images' 
        : 'No hero images found - check bucket permissions or file paths'
    });

  } catch (error) {
    console.error('API: Error fetching hero images:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch hero images',
      images: [],
      count: 0
    }, { status: 500 });
  }
}