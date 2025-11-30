// Simple password hash generator
// Usage: node scripts/hash-password.js "your-password-here"

const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = process.argv[2]; // Get password from command line argument
  
  if (!password) {
    console.log('❌ Please provide a password as an argument');
    console.log('Usage: node scripts/hash-password.js "your-password-here"');
    return;
  }
  
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Password Hash Generated:');
    console.log('Password:', password);
    console.log('Hash:', hashedPassword);
    console.log('');
    console.log('📋 SQL to insert admin user:');
    console.log(`
INSERT INTO admin (name, email, password_hash, role, phone) 
VALUES (
    'Super Admin',
    'admin@bikersalliance.com',
    '${hashedPassword}',
    'super_admin',
    '+91-9876543210'
);`);
    
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

hashPassword();