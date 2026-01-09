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

async function addMissingColumns() {
  try {
    // Check if description column exists and add it if it doesn't
    console.log('Adding missing columns to web_stories table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          -- Add description column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_stories' AND column_name = 'description') THEN
            ALTER TABLE web_stories ADD COLUMN description TEXT;
            RAISE NOTICE 'Added description column to web_stories table';
          ELSE
            RAISE NOTICE 'Description column already exists in web_stories table';
          END IF;

          -- Add category column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_stories' AND column_name = 'category') THEN
            ALTER TABLE web_stories ADD COLUMN category TEXT DEFAULT 'General';
            RAISE NOTICE 'Added category column to web_stories table';
          ELSE
            RAISE NOTICE 'Category column already exists in web_stories table';
          END IF;

          -- Add featured column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_stories' AND column_name = 'featured') THEN
            ALTER TABLE web_stories ADD COLUMN featured BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added featured column to web_stories table';
          ELSE
            RAISE NOTICE 'Featured column already exists in web_stories table';
          END IF;
        END $$;
      `
    });

    if (error) {
      // Try alternative approach using direct SQL
      console.log('Direct SQL approach failed, trying individual ALTER TABLE commands...');
      
      // Add description column
      try {
        await supabase.rpc('exec_sql', { 
          sql: 'ALTER TABLE web_stories ADD COLUMN IF NOT EXISTS description TEXT;' 
        });
        console.log('Added description column');
      } catch (e) {
        console.log('Description column may already exist or failed to add:', e.message);
      }

      // Add category column  
      try {
        await supabase.rpc('exec_sql', { 
          sql: "ALTER TABLE web_stories ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';" 
        });
        console.log('Added category column');
      } catch (e) {
        console.log('Category column may already exist or failed to add:', e.message);
      }

      // Add featured column
      try {
        await supabase.rpc('exec_sql', { 
          sql: 'ALTER TABLE web_stories ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;' 
        });
        console.log('Added featured column');
      } catch (e) {
        console.log('Featured column may already exist or failed to add:', e.message);
      }
    } else {
      console.log('Columns checked/added successfully');
    }

    // Verify the table structure
    console.log('\nVerifying web_stories table structure...');
    const { data: structure, error: structError } = await supabase
      .from('web_stories')
      .select('*')
      .limit(1);

    if (structError) {
      console.error('Error checking table structure:', structError);
    } else {
      console.log('Table structure verified successfully');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addMissingColumns();