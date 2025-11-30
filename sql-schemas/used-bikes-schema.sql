-- Create used_bikes table to store bike listings from sell-bike form
CREATE TABLE public.used_bikes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Bike Details
  brand character varying NOT NULL,
  model character varying NOT NULL,
  variant character varying,
  year integer NOT NULL,
  category character varying NOT NULL,
  fuel_type character varying NOT NULL,
  transmission character varying NOT NULL,
  km_driven integer NOT NULL,
  ownership character varying NOT NULL,
  
  -- Pricing and Condition
  expected_price integer NOT NULL,
  condition character varying NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair')),
  description text,
  
  -- Contact Details
  owner_name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying NOT NULL,
  city character varying NOT NULL,
  state character varying NOT NULL,
  
  -- Documents
  has_rc boolean DEFAULT false,
  has_insurance boolean DEFAULT false,
  has_puc boolean DEFAULT false,
  
  -- Photos
  photos jsonb DEFAULT '[]'::jsonb, -- Array of image URLs
  
  -- Status and admin fields
  status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold')),
  admin_notes text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  sold_at timestamp with time zone,
  
  CONSTRAINT used_bikes_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX idx_used_bikes_brand ON public.used_bikes (brand);
CREATE INDEX idx_used_bikes_category ON public.used_bikes (category);
CREATE INDEX idx_used_bikes_fuel_type ON public.used_bikes (fuel_type);
CREATE INDEX idx_used_bikes_city ON public.used_bikes (city);
CREATE INDEX idx_used_bikes_status ON public.used_bikes (status);
CREATE INDEX idx_used_bikes_price_range ON public.used_bikes (expected_price);
CREATE INDEX idx_used_bikes_created_at ON public.used_bikes (created_at);
CREATE INDEX idx_used_bikes_year ON public.used_bikes (year);
CREATE INDEX idx_used_bikes_km_driven ON public.used_bikes (km_driven);

-- Create RLS policies for security
ALTER TABLE public.used_bikes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for sell-bike form submissions)
CREATE POLICY "Allow insert for anyone" ON public.used_bikes
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read approved listings
CREATE POLICY "Allow read for approved listings" ON public.used_bikes
  FOR SELECT USING (status = 'approved');

-- Allow admins to do everything
CREATE POLICY "Allow all for admins" ON public.used_bikes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE admin.id = auth.uid() AND admin.is_active = true
    )
  );

-- Create storage bucket for used bike images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sell-bikes', 'sell-bikes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the sell-bikes bucket
CREATE POLICY "Anyone can upload to sell-bikes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sell-bikes');

CREATE POLICY "Anyone can view sell-bikes images" ON storage.objects
  FOR SELECT USING (bucket_id = 'sell-bikes');

CREATE POLICY "Admins can delete sell-bikes images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'sell-bikes' AND 
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE admin.id = auth.uid() AND admin.is_active = true
    )
  );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_used_bikes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_used_bikes_updated_at
    BEFORE UPDATE ON public.used_bikes
    FOR EACH ROW
    EXECUTE FUNCTION update_used_bikes_updated_at();

-- Add some sample data for testing (optional)
INSERT INTO public.used_bikes (
  brand, model, variant, year, category, fuel_type, transmission, km_driven, ownership,
  expected_price, condition, description, owner_name, email, phone, city, state,
  has_rc, has_insurance, has_puc, status
) VALUES 
(
  'Honda', 'Activa 6G', 'Standard', 2022, 'Scooter', 'Petrol', 'CVT', 12000, 'First Owner',
  65000, 'Good', 'Well maintained Honda Activa, single owner, all papers clear',
  'Rahul Kumar', 'rahul@example.com', '+91 9876543210', 'Mumbai', 'Maharashtra',
  true, true, true, 'approved'
),
(
  'Royal Enfield', 'Classic 350', 'Standard', 2021, 'Cruiser', 'Petrol', 'Manual', 8500, 'First Owner',
  145000, 'Excellent', 'Like new Royal Enfield Classic 350, barely used',
  'Priya Sharma', 'priya@example.com', '+91 8765432109', 'Delhi', 'Delhi',
  true, true, false, 'approved'
);