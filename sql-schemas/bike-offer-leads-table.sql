-- Bike Offer Leads Table
-- Run this in your Supabase SQL Editor to create the bike offer leads table

CREATE TABLE IF NOT EXISTS bike_offer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  offer_id INTEGER,
  bike_name TEXT NOT NULL,
  dealer_name TEXT,
  offer_title TEXT,
  offer_price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  discount_percent DECIMAL(5,2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bike_offer_leads_created_at ON bike_offer_leads(created_at);
CREATE INDEX idx_bike_offer_leads_status ON bike_offer_leads(status);
CREATE INDEX idx_bike_offer_leads_email ON bike_offer_leads(email);
CREATE INDEX idx_bike_offer_leads_mobile ON bike_offer_leads(mobile);

-- Enable Row Level Security (RLS)
ALTER TABLE bike_offer_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bike_offer_leads
-- Allow admins to view all leads
CREATE POLICY "Admin can view all bike offer leads" ON bike_offer_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Allow admins to update leads
CREATE POLICY "Admin can update bike offer leads" ON bike_offer_leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Allow insertion of new leads (for the API)
CREATE POLICY "Allow insert bike offer leads" ON bike_offer_leads
  FOR INSERT WITH CHECK (true);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_bike_offer_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_bike_offer_leads_updated_at
  BEFORE UPDATE ON bike_offer_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_bike_offer_leads_updated_at();