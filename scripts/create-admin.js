// Script to create admin user with properly hashed password
// Run this in Node.js to generate the SQL with correct bcrypt hash

const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const password = 'admin123!'; // Change this to your desired password
  const saltRounds = 10;
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('=== ADMIN USER CREATION SQL ===');
    console.log(`
-- Insert admin user with properly hashed password
INSERT INTO admin (name, email, password_hash, role, phone) 
VALUES (
    'Super Admin',
    'admin@bikersalliance.com',
    '${hashedPassword}',
    'super_admin',
    '+91-9876543210'
);
    `);
    
    console.log('=== CREDENTIALS FOR LOGIN ===');
    console.log('Email: admin@bikersalliance.com');
    console.log('Password: admin123!');
    console.log('');
    console.log('Copy the SQL above and run it in your Supabase SQL editor.');
    
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

createAdminUser();