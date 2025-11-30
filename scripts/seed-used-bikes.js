// Simple script to add test data to used_bikes table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testBikes = [
  {
    brand: 'Honda',
    model: 'Activa 6G',
    variant: 'Standard',
    year: 2022,
    category: 'Scooter',
    fuel_type: 'Petrol',
    transmission: 'CVT',
    km_driven: 12000,
    ownership: 'First Owner',
    expected_price: 65000,
    condition: 'Good',
    description: 'Well maintained Honda Activa, single owner, all papers clear',
    owner_name: 'Rahul Kumar',
    email: 'rahul@example.com',
    phone: '+91 9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    has_rc: true,
    has_insurance: true,
    has_puc: true,
    status: 'approved'
  },
  {
    brand: 'Royal Enfield',
    model: 'Classic 350',
    variant: 'Standard',
    year: 2021,
    category: 'Cruiser',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    km_driven: 8500,
    ownership: 'First Owner',
    expected_price: 145000,
    condition: 'Excellent',
    description: 'Like new Royal Enfield Classic 350, barely used',
    owner_name: 'Priya Singh',
    email: 'priya@example.com',
    phone: '+91 8765432109',
    city: 'Delhi',
    state: 'Delhi',
    has_rc: true,
    has_insurance: true,
    has_puc: false,
    status: 'approved'
  },
  {
    brand: 'Bajaj',
    model: 'Pulsar NS200',
    variant: 'Standard',
    year: 2020,
    category: 'Sport',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    km_driven: 25000,
    ownership: 'Second Owner',
    expected_price: 85000,
    condition: 'Good',
    description: 'Powerful Pulsar NS200, well maintained, new tyres recently fitted',
    owner_name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 9234567890',
    city: 'Mumbai',
    state: 'Maharashtra',
    has_rc: true,
    has_insurance: true,
    has_puc: false,
    status: 'approved'
  },
  {
    brand: 'TVS',
    model: 'Apache RTR 160 4V',
    variant: 'Standard',
    year: 2022,
    category: 'Sport',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    km_driven: 8000,
    ownership: 'First Owner',
    expected_price: 95000,
    condition: 'Excellent',
    description: 'TVS Apache RTR 160 4V in mint condition',
    owner_name: 'Karthik Reddy',
    email: 'karthik@example.com',
    phone: '+91 8765123409',
    city: 'Bangalore',
    state: 'Karnataka',
    has_rc: true,
    has_insurance: true,
    has_puc: true,
    status: 'approved'
  },
  {
    brand: 'Hero',
    model: 'Splendor Plus',
    variant: 'Standard',
    year: 2023,
    category: 'Commuter',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    km_driven: 5000,
    ownership: 'First Owner',
    expected_price: 55000,
    condition: 'Excellent',
    description: 'Almost new Hero Splendor Plus',
    owner_name: 'Vikash Kumar',
    email: 'vikash@example.com',
    phone: '+91 8123456789',
    city: 'Delhi',
    state: 'Delhi',
    has_rc: true,
    has_insurance: true,
    has_puc: true,
    status: 'approved'
  },
  {
    brand: 'TVS',
    model: 'Jupiter',
    variant: 'Standard',
    year: 2023,
    category: 'Scooter',
    fuel_type: 'Petrol',
    transmission: 'CVT',
    km_driven: 3000,
    ownership: 'First Owner',
    expected_price: 68000,
    condition: 'Excellent',
    description: 'Brand new TVS Jupiter, barely used',
    owner_name: 'Ravi Shankar',
    email: 'ravi@example.com',
    phone: '+91 9345678901',
    city: 'Chennai',
    state: 'Tamil Nadu',
    has_rc: true,
    has_insurance: true,
    has_puc: true,
    status: 'approved'
  }
];

async function seedDatabase() {
  console.log('Starting to seed used_bikes table...');
  
  // Insert test data
  const { data, error } = await supabase
    .from('used_bikes')
    .insert(testBikes)
    .select();
  
  if (error) {
    console.error('Error inserting test data:', error);
    return;
  }
  
  console.log('Successfully inserted', data?.length || 0, 'used bikes');
  console.log('Sample data:', data?.[0]);
}

// Run the seeder
seedDatabase().catch(console.error);