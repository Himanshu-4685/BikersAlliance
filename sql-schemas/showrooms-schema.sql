-- Create showrooms table
CREATE TABLE IF NOT EXISTS public.showrooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand_id VARCHAR(50) NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    brand_slug VARCHAR(100) NOT NULL,
    brand_logo VARCHAR(255),
    
    -- Address fields
    street VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(255),
    
    -- Contact information
    phone JSONB NOT NULL, -- Array of phone numbers
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    
    -- Business hours
    timings_weekdays VARCHAR(100) NOT NULL,
    timings_weekends VARCHAR(100) NOT NULL,
    timings_holidays VARCHAR(100),
    
    -- Services and features
    services JSONB NOT NULL, -- Array of services
    image VARCHAR(255) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviews INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    
    -- Location coordinates
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Additional information
    description TEXT,
    established VARCHAR(4),
    area_served JSONB, -- Array of areas served
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_showrooms_city ON public.showrooms(city);
CREATE INDEX IF NOT EXISTS idx_showrooms_state ON public.showrooms(state);
CREATE INDEX IF NOT EXISTS idx_showrooms_brand_id ON public.showrooms(brand_id);
CREATE INDEX IF NOT EXISTS idx_showrooms_slug ON public.showrooms(slug);
CREATE INDEX IF NOT EXISTS idx_showrooms_featured ON public.showrooms(featured);
CREATE INDEX IF NOT EXISTS idx_showrooms_verified ON public.showrooms(verified);
CREATE INDEX IF NOT EXISTS idx_showrooms_rating ON public.showrooms(rating DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.showrooms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access on showrooms" ON public.showrooms
    FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update (for admin)
CREATE POLICY "Allow authenticated users to manage showrooms" ON public.showrooms
    FOR ALL USING (auth.role() = 'authenticated');

-- Create charging_stations table
CREATE TABLE IF NOT EXISTS public.charging_stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    
    -- Address fields
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    
    -- Contact information
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Operating details
    timing VARCHAR(100) NOT NULL,
    connector_types JSONB NOT NULL, -- Array of connector types
    charging_speed VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance', 'Out of Order')),
    pricing VARCHAR(50) NOT NULL,
    amenities JSONB, -- Array of amenities
    
    -- Location coordinates
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    
    -- Additional information
    description TEXT,
    operator VARCHAR(100),
    capacity INTEGER DEFAULT 1,
    power_output VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for charging stations
CREATE INDEX IF NOT EXISTS idx_charging_stations_city ON public.charging_stations(city);
CREATE INDEX IF NOT EXISTS idx_charging_stations_state ON public.charging_stations(state);
CREATE INDEX IF NOT EXISTS idx_charging_stations_status ON public.charging_stations(status);
CREATE INDEX IF NOT EXISTS idx_charging_stations_slug ON public.charging_stations(slug);

-- Enable RLS for charging stations
ALTER TABLE public.charging_stations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access on charging stations" ON public.charging_stations
    FOR SELECT USING (true);

-- Create policy for authenticated users to manage charging stations
CREATE POLICY "Allow authenticated users to manage charging stations" ON public.charging_stations
    FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_showrooms_updated_at BEFORE UPDATE ON public.showrooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charging_stations_updated_at BEFORE UPDATE ON public.charging_stations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();