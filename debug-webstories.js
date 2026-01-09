#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugWebStories() {
  try {
    console.log('🔍 Debugging Web Stories...\n');
    
    // 1. Check if images exist locally
    console.log('1. Checking local images:');
    const imageDir = path.join(__dirname, 'public', 'images', 'web-stories');
    if (fs.existsSync(imageDir)) {
      const files = fs.readdirSync(imageDir);
      console.log('   Local images found:', files);
    } else {
      console.log('   ❌ Image directory not found!');
    }

    // 2. Fetch web stories from database
    console.log('\n2. Fetching web stories from database:');
    const { data: stories, error } = await supabase
      .from('web_stories')
      .select('*')
      .eq('is_published', true)
      .limit(5);

    if (error) {
      console.error('   ❌ Database error:', error);
      return;
    }

    if (!stories || stories.length === 0) {
      console.log('   ❌ No stories found in database');
      return;
    }

    console.log(`   ✅ Found ${stories.length} stories in database`);

    // 3. Check each story's structure
    console.log('\n3. Story details:');
    stories.forEach((story, index) => {
      console.log(`\n   Story ${index + 1}: ${story.title}`);
      console.log(`   - Slug: ${story.slug}`);
      console.log(`   - Cover Image: ${story.cover_image_url}`);
      console.log(`   - Pages: ${Array.isArray(story.pages) ? story.pages.length : 'Invalid'}`);
      
      if (Array.isArray(story.pages)) {
        story.pages.forEach((page, pageIndex) => {
          console.log(`     Page ${pageIndex + 1}: ${page.image_url} - ${page.caption || 'No caption'}`);
        });
      }
    });

    // 4. Test a specific story
    console.log('\n4. Testing specific story:');
    const testSlug = 'top-adventure-bikes-under-3-lakhs';
    const { data: testStory, error: testError } = await supabase
      .from('web_stories')
      .select('*')
      .eq('slug', testSlug)
      .single();

    if (testError) {
      console.error(`   ❌ Error fetching story with slug "${testSlug}":`, testError);
    } else {
      console.log(`   ✅ Successfully fetched story: ${testStory.title}`);
      console.log(`   - Pages count: ${Array.isArray(testStory.pages) ? testStory.pages.length : 'Invalid'}`);
      console.log(`   - First page image: ${testStory.pages?.[0]?.image_url || 'None'}`);
    }

    console.log('\n✅ Debug complete!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

debugWebStories();