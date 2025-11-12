// Types for bike status system

export interface BikeStatus {
  id: number;
  status: 'upcoming' | 'new_launch';
  priceRange: string;
  expectedLaunch?: string;
  launchDate?: string;
  brand: {
    id: string;
    name: string;
    logo: string;
  };
  model: {
    id: number;
    name: string;
  };
  variant: {
    id: number;
    name: string;
    onRoadPrice?: number;
    slug: string;
    images: BikeImage[];
    specs?: BikeSpecs;
  };
}

export interface BikeImage {
  image_id: number;
  url: string;
  alt_text: string;
}

export interface BikeSpecs {
  engine_type?: string;
  displacement?: string;
  peak_power?: string;
  city_mileage?: string;
  highway_mileage?: string;
  body_type?: string;
  transmission?: string;
  max_torque?: string;
}

export interface BikeStatusApiResponse {
  success: boolean;
  data: BikeStatus[];
  count: number;
  error?: string;
}

// Form data for creating/updating bike status
export interface BikeStatusFormData {
  brand_id: string;
  model_id: number;
  variant_id: number;
  status: 'upcoming' | 'new_launch';
  price_range: string;
  expected_launch?: string;
  launch_date?: string;
}