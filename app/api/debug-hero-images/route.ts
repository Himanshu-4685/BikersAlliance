import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    expectedBucket: 'Bikeralliance',
    expectedPath: 'Image/hero_section',
    expectedUrl: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/',
    tests: []
  };

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    debugInfo.supabaseClient = 'Successfully created';

    // Test 1: List all buckets
    console.log('🔍 DEBUG: Testing bucket listing...');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      debugInfo.tests.push({
        test: 'List all buckets',
        success: !bucketsError,
        data: buckets,
        error: bucketsError,
        bucketNames: buckets ? buckets.map(b => b.name) : null
      });
      console.log('📦 Available buckets:', buckets);
    } catch (e) {
      debugInfo.tests.push({
        test: 'List all buckets',
        success: false,
        error: String(e)
      });
    }

    // Test 2: Check if Bikeralliance bucket exists and list root contents
    console.log('🔍 DEBUG: Testing Bikeralliance bucket root...');
    try {
      const { data: rootContents, error: rootError } = await supabase.storage
        .from('Bikeralliance')
        .list('', { limit: 100 });
      
      debugInfo.tests.push({
        test: 'List Bikeralliance bucket root',
        success: !rootError,
        data: rootContents,
        error: rootError,
        folderNames: rootContents ? rootContents.filter(item => !item.name.includes('.')).map(f => f.name) : null
      });
      console.log('📂 Root contents of Bikeralliance:', rootContents);
    } catch (e) {
      debugInfo.tests.push({
        test: 'List Bikeralliance bucket root',
        success: false,
        error: String(e)
      });
    }

    // Test 3: Check Image folder contents
    console.log('🔍 DEBUG: Testing Image folder...');
    try {
      const { data: imageContents, error: imageError } = await supabase.storage
        .from('Bikeralliance')
        .list('Image', { limit: 100 });
      
      debugInfo.tests.push({
        test: 'List Image folder contents',
        success: !imageError,
        data: imageContents,
        error: imageError,
        subfolders: imageContents ? imageContents.filter(item => !item.name.includes('.')).map(f => f.name) : null
      });
      console.log('📂 Image folder contents:', imageContents);
    } catch (e) {
      debugInfo.tests.push({
        test: 'List Image folder contents',
        success: false,
        error: String(e)
      });
    }

    // Test 4: Check Image/hero_section folder contents
    console.log('🔍 DEBUG: Testing Image/hero_section folder...');
    try {
      const { data: heroContents, error: heroError } = await supabase.storage
        .from('Bikeralliance')
        .list('Image/hero_section', { limit: 100 });
      
      debugInfo.tests.push({
        test: 'List Image/hero_section contents',
        success: !heroError,
        data: heroContents,
        error: heroError,
        imageFiles: heroContents ? heroContents.filter(item => 
          /\.(jpg|jpeg|png|avif|webp)$/i.test(item.name)
        ) : null
      });
      console.log('🖼️ Hero section contents:', heroContents);
    } catch (e) {
      debugInfo.tests.push({
        test: 'List Image/hero_section contents',
        success: false,
        error: String(e)
      });
    }

    // Test 5: Try to generate public URLs for known files
    console.log('🔍 DEBUG: Testing public URL generation...');
    const knownFiles = [
      'Ampere-Magnus-Grand.avif',
      'Hero-Destini-110_Desktop_1686x548px.avif',
      'kawa.jpg',
      'TVS XL100.avif',
      'Ultraviolette-X47-Crossover_Desktop_1686x548px.avif'
    ];

    const urlTests = [];
    for (const filename of knownFiles) {
      try {
        const { data: urlData } = supabase.storage
          .from('Bikeralliance')
          .getPublicUrl(`Image/hero_section/${filename}`);
        
        urlTests.push({
          filename,
          generatedUrl: urlData.publicUrl,
          expectedUrl: `https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/hero_section/${filename}`,
          matches: urlData.publicUrl.includes(filename)
        });
      } catch (e) {
        urlTests.push({
          filename,
          error: String(e)
        });
      }
    }

    debugInfo.tests.push({
      test: 'Generate public URLs for known files',
      success: true,
      data: urlTests
    });

    // Test 6: Try different bucket name variations
    console.log('🔍 DEBUG: Testing bucket name variations...');
    const bucketVariations = ['Bikeralliance', 'bikeralliance', 'BikerAlliance'];
    const bucketTests = [];

    for (const bucketName of bucketVariations) {
      try {
        const { data: varContents, error: varError } = await supabase.storage
          .from(bucketName)
          .list('Image/hero_section', { limit: 10 });
        
        bucketTests.push({
          bucketName,
          success: !varError,
          data: varContents,
          error: varError
        });
      } catch (e) {
        bucketTests.push({
          bucketName,
          success: false,
          error: String(e)
        });
      }
    }

    debugInfo.tests.push({
      test: 'Try different bucket name variations',
      success: true,
      data: bucketTests
    });

    // Test 7: Check authentication status
    console.log('🔍 DEBUG: Testing authentication...');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      debugInfo.tests.push({
        test: 'Authentication status',
        success: !authError,
        authenticated: !!user,
        user: user ? { id: user.id, email: user.email } : null,
        error: authError
      });
    } catch (e) {
      debugInfo.tests.push({
        test: 'Authentication status',
        success: false,
        error: String(e)
      });
    }

    // Summary
    debugInfo.summary = {
      totalTests: debugInfo.tests.length,
      successfulTests: debugInfo.tests.filter((t: any) => t.success).length,
      failedTests: debugInfo.tests.filter((t: any) => !t.success).length
    };

    console.log('✅ DEBUG: All tests completed', debugInfo.summary);

  } catch (error) {
    console.error('❌ DEBUG: Critical error:', error);
    debugInfo.criticalError = String(error);
  }

  return NextResponse.json(debugInfo, { 
    headers: { 'Content-Type': 'application/json' },
    status: 200 
  });
}