// Test script for new API endpoints
const timestamp = Date.now();

const testNewsAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Test News Article ${timestamp}`,
        slug: `test-news-article-${timestamp}`,
        excerpt: 'This is a test excerpt',
        content: '<p>This is test content</p>',
        is_published: false
      })
    });

    const data = await response.json();
    console.log('News API Response:', data);
    return data.success;
  } catch (error) {
    console.error('News API Error:', error);
    return false;
  }
};

const testVideosAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },  
      body: JSON.stringify({
        title: `Test Video ${timestamp}`,
        slug: `test-video-${timestamp}`,
        description: 'This is a test video description',
        video_url: 'https://www.youtube.com/watch?v=test',
        is_published: false
      })
    });

    const data = await response.json();
    console.log('Videos API Response:', data);
    return data.success;
  } catch (error) {
    console.error('Videos API Error:', error);
    return false;
  }
};

const testWebStoriesAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/webstories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Test Web Story ${timestamp}`,
        slug: `test-web-story-${timestamp}`,
        pages: [
          { image_url: 'http://example.com/image1.jpg', caption: 'Page 1' },
          { image_url: 'http://example.com/image2.jpg', caption: 'Page 2' }
        ],
        is_published: false
      })
    });

    const data = await response.json();
    console.log('Web Stories API Response:', data);
    return data.success;
  } catch (error) {
    console.error('Web Stories API Error:', error);
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Testing API endpoints...\n');
  
  console.log('📰 Testing News API...');
  const newsResult = await testNewsAPI();
  console.log(newsResult ? '✅ News API works!' : '❌ News API failed');
  
  console.log('\n🎥 Testing Videos API...');
  const videosResult = await testVideosAPI();
  console.log(videosResult ? '✅ Videos API works!' : '❌ Videos API failed');
  
  console.log('\n📱 Testing Web Stories API...');
  const webStoriesResult = await testWebStoriesAPI();
  console.log(webStoriesResult ? '✅ Web Stories API works!' : '❌ Web Stories API failed');
  
  console.log('\n🏁 Test Summary:');
  console.log(`News API: ${newsResult ? '✅' : '❌'}`);
  console.log(`Videos API: ${videosResult ? '✅' : '❌'}`);
  console.log(`Web Stories API: ${webStoriesResult ? '✅' : '❌'}`);
  
  if (newsResult && videosResult && webStoriesResult) {
    console.log('\n🎉 All APIs are working correctly!');
  } else {
    console.log('\n⚠️ Some APIs may need database tables to be created first.');
    console.log('Run the SQL in sql-schemas/news_videos_webstories.sql in your Supabase project.');
  }
};

runTests();