#!/usr/bin/env node

const fetch = require('node-fetch');

async function testWebStoriesAPI() {
  try {
    console.log('Testing Web Stories API...');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/web-stories?limit=5');
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.length > 0) {
      console.log(`\n✅ Successfully fetched ${data.data.length} web stories`);
      
      data.data.forEach((story, index) => {
        console.log(`${index + 1}. ${story.title} (${story.slug})`);
        console.log(`   Category: ${story.category}, Featured: ${story.featured ? 'Yes' : 'No'}`);
        console.log(`   Pages: ${Array.isArray(story.pages) ? story.pages.length : 0}`);
      });
    } else {
      console.log('❌ No web stories found or API failed');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testWebStoriesAPI();