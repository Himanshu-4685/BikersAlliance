// Script to ensure Brand_image folder exists in Supabase storage
// Run this once to set up the Brand_image folder

import { storageManager } from '../utils/supabase-storage.js';

async function ensureBrandImageFolder() {
  console.log('Checking for Brand_image folder...');
  
  try {
    // Try to list folders first
    const { folders, error } = await storageManager.listImageFolders();
    
    if (error) {
      console.error('Error listing folders:', error);
      return;
    }
    
    console.log('Existing folders:', folders.map(f => f.name));
    
    // Check if Brand_image folder exists
    const brandImageExists = folders.some(folder => folder.name === 'Brand_image');
    
    if (brandImageExists) {
      console.log('✅ Brand_image folder already exists');
    } else {
      console.log('Creating Brand_image folder...');
      const createResult = await storageManager.createFolder('Brand_image');
      
      if (createResult.success) {
        console.log('✅ Brand_image folder created successfully');
      } else {
        console.error('❌ Failed to create Brand_image folder:', createResult.error);
      }
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the function
ensureBrandImageFolder();