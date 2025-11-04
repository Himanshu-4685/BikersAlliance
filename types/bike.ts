// Database bike structure from API
export interface BikeFromDB {
  variant_id: string;
  variant_name: string;
  on_road_price: number;
  variant_url: string;
  brand_name: string;
  brand_logo: string;
  model_name: string;
  engine_type: string;
  displacement: string; // Actually stored as string like "99.7 cc"
  peak_power: string; // Actually stored as string like "8.02 PS @ 8000 rpm"
  city_mileage: string; // Actually stored as string like "80 kmpl"
  bike_style: string;
  image_url: string;
}

// Electric bike specific structure for UI components
export interface ElectricBike {
  variant_id: string;
  variant_name: string;
  on_road_price: number;
  variant_url: string;
  brand_name: string;
  brand_logo: string;
  model_name: string;
  engine_type: string;
  displacement: number;
  peak_power: number;
  city_mileage: number;
  bike_style: string;
  image_url: string;
}

// Formatted bike structure for UI components
export interface Bike {
  id: string;
  name: string;
  slug?: string; // Add optional slug for navigation
  image: string;
  price: string;
  specs: {
    engine: string;
    mileage: string;
    power: string;
  };
}

// API Response structure
export interface BikesApiResponse {
  bikes: BikeFromDB[];
}

// Body Type structure
export interface BodyType {
  name: string;
  slug: string;
  count: number;
}

// Body Type API Response
export interface BodyTypesApiResponse {
  bodyTypes: BodyType[];
  total: number;
}

// Body Type Bikes API Response
export interface BodyTypeBikesApiResponse {
  bikes: FormattedBike[];
  bodyType: {
    name: string;
    slug: string;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Enhanced bike structure for body type pages
export interface FormattedBike {
  id: string;
  name: string;
  slug: string;
  brand: {
    name: string;
    logo: string | null;
  };
  model: string;
  image: string | null;
  price: number | null;
  specs: {
    bodyType: string;
    engine: string;
    displacement: string;
    power: string;
    mileage: string;
  };
}