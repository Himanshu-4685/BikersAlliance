-- User Orders and Leads Tables
-- Run this in your Supabase SQL Editor to create the required tables

-- User Orders Table
CREATE TABLE IF NOT EXISTS user_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id INTEGER NOT NULL,
  bike_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  brand_name TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads Table (for Get On Road Price and Book Test Ride)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  variant_id INTEGER NOT NULL,
  bike_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('get_on_road_price', 'book_test_ride')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_orders_user_id ON user_orders(user_id);
CREATE INDEX idx_user_orders_created_at ON user_orders(created_at);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_lead_type ON leads(lead_type);
CREATE INDEX idx_leads_status ON leads(status);

-- Enable Row Level Security (RLS)
ALTER TABLE user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_orders
CREATE POLICY "Users can view own orders" ON user_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON user_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON user_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON user_orders
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leads (anyone can insert, admins can read all)
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view all leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_orders_updated_at
    BEFORE UPDATE ON user_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE user_orders IS 'Store user bike orders';
COMMENT ON TABLE leads IS 'Store leads from Get On Road Price and Book Test Ride forms';
COMMENT ON COLUMN leads.lead_type IS 'Type of lead: get_on_road_price or book_test_ride';
COMMENT ON COLUMN user_orders.status IS 'Order status: pending, confirmed, cancelled';
COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, closed';