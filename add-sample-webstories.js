#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Real web stories data using the uploaded images
const webStories = [
  {
    title: 'Best Sports Bikes in India',
    slug: 'best-sports-bikes-in-india',
    description: 'Discover the top sports bikes available in India with detailed analysis of performance, features, and pricing.',
    cover_image_url: '/images/web-stories/1.avif',
    author: 'BikersAlliance Editorial',
    category: 'Buying Guide',
    featured: true,
    is_published: true,
    pages: [
      {
        image_url: '/images/web-stories/1.avif',
        caption: 'Top Sports Bikes in India - Performance Meets Style'
      },
      {
        image_url: '/images/web-stories/2.avif',
        caption: 'Kawasaki Ninja Series - Track-Ready Performance'
      },
      {
        image_url: '/images/web-stories/3.avif',
        caption: 'Yamaha R Series - Racing DNA'
      },
      {
        image_url: '/images/web-stories/4.avif',
        caption: 'Honda CBR Series - Reliability & Performance'
      }
    ]
  },
  {
    title: 'Top Adventure Bikes Under 3 Lakhs',
    slug: 'top-adventure-bikes-under-3-lakhs',
    description: 'Explore the best adventure motorcycles available under 3 lakhs that offer great value for money and off-road capabilities.',
    cover_image_url: '/images/web-stories/2.avif',
    author: 'BikersAlliance Editorial',
    category: 'Buying Guide',
    featured: true,
    is_published: true,
    pages: [
      {
        image_url: '/images/web-stories/2.avif',
        caption: 'Adventure Bikes Under 3 Lakhs - Budget Adventure Touring'
      },
      {
        image_url: '/images/web-stories/5.avif',
        caption: 'Royal Enfield Himalayan - The Budget Adventure King'
      },
      {
        image_url: '/images/web-stories/6.avif',
        caption: 'Hero Xpulse 200 - Affordable Off-Road Champion'
      },
      {
        image_url: '/images/web-stories/7.avif',
        caption: 'KTM Adventure Series - Performance & Reliability'
      }
    ]
  },
  {
    title: 'Upcoming Bikes 2024',
    slug: 'upcoming-bikes-2024',
    description: 'Get excited about the latest motorcycle launches coming to India in 2024 with detailed previews and expected specifications.',
    cover_image_url: '/images/web-stories/3.avif',
    author: 'BikersAlliance Editorial',
    category: 'General',
    featured: false,
    is_published: true,
    pages: [
      {
        image_url: '/images/web-stories/3.avif',
        caption: 'Upcoming Bikes 2024 - What to Expect This Year'
      },
      {
        image_url: '/images/web-stories/4.avif',
        caption: 'New Electric Motorcycles Coming Soon'
      },
      {
        image_url: '/images/web-stories/1.avif',
        caption: 'Sport Bike Updates and New Models'
      }
    ]
  },
  {
    title: 'Best Mileage Bikes Under 2 Lakhs',
    slug: 'best-mileage-bikes-under-2-lakhs',
    description: 'Find the most fuel-efficient motorcycles under 2 lakhs that offer excellent mileage without compromising on performance.',
    cover_image_url: '/images/web-stories/4.avif',
    author: 'BikersAlliance Editorial',
    category: 'Buying Guide',
    featured: false,
    is_published: true,
    pages: [
      {
        image_url: '/images/web-stories/4.avif',
        caption: 'Best Mileage Bikes Under 2 Lakhs - Fuel Efficiency Champions'
      },
      {
        image_url: '/images/web-stories/5.avif',
        caption: 'Honda Shine - The Mileage King'
      },
      {
        image_url: '/images/web-stories/6.avif',
        caption: 'Bajaj Platina - Budget-Friendly Efficiency'
      }
    ]
  },
  {
    title: 'Best Upcoming Electric Bikes',
    slug: 'best-upcoming-electric-bikes',
    description: 'Explore the future of motorcycling with upcoming electric bikes that promise zero emissions and cutting-edge technology.',
    cover_image_url: '/images/web-stories/5.avif',
    author: 'BikersAlliance Editorial',
    category: 'Performance',
    featured: true,
    is_published: true,
    pages: [
      {
        image_url: '/images/web-stories/5.avif',
        caption: 'Best Upcoming Electric Bikes - The Future is Electric'
      },
      {
        image_url: '/images/web-stories/6.avif',
        caption: 'Ola Electric Series - Revolutionary Design'
      },
      {
        image_url: '/images/web-stories/7.avif',
        caption: 'TVS iQube Series - Smart Electric Mobility'
      }
    ]
  }
];

async function addWebStories() {
  console.log('Adding web stories to database...');
  
  try {
    // First, clear any existing stories with these slugs
    const slugs = webStories.map(story => story.slug);
    const { error: deleteError } = await supabase
      .from('web_stories')
      .delete()
      .in('slug', slugs);
    
    if (deleteError) {
      console.warn('Warning: Could not delete existing stories:', deleteError.message);
    }

    // Insert new web stories
    const { data, error } = await supabase
      .from('web_stories')
      .insert(webStories.map(story => ({
        ...story,
        published_at: new Date().toISOString()
      })));

    if (error) {
      console.error('Error inserting web stories:', error);
      return;
    }

    console.log(`Successfully added ${webStories.length} web stories!`);
    
    // Verify insertion
    const { data: verification, error: verifyError } = await supabase
      .from('web_stories')
      .select('title, slug, category, featured')
      .in('slug', slugs);

    if (verifyError) {
      console.error('Error verifying insertion:', verifyError);
      return;
    }

    console.log('\nAdded stories:');
    verification.forEach(story => {
      console.log(`- ${story.title} (${story.slug}) - ${story.category} ${story.featured ? '[Featured]' : ''}`);
    });

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addWebStories();