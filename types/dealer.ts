// Dealer related types for the BikersAlliance application

export interface Dealer {
  dealer_id: number;
  name: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface DealerFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
}

export interface DealerSearchParams {
  q?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export interface DealerApiResponse {
  success: boolean;
  data?: Dealer | Dealer[] | {
    dealers: Dealer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
  message?: string;
  details?: string;
}

export interface DealerSearchResponse {
  success: boolean;
  data?: Dealer[];
  count?: number;
  error?: string;
  details?: string;
}