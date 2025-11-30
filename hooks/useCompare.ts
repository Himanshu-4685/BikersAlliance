import { useState } from 'react';

export interface ComparisonVariant {
  variant_id: string;
  variant_name: string;
  brand_name: string;
  model_name: string;
  on_road_price: number;
  brand_logo: string;
  image_url: string;
  variant_url: string;
  specs: Record<string, any>;
  images: Array<{ variant_id: string; url: string; alt_text?: string }>;
  averageRating: number | null;
  reviewCount: number;
  displacement: string;
  peak_power: string;
  city_mileage: string;
  engine_type: string;
  body_type: string;
}

export const useCompare = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareVariants = async (variantIds: string[]): Promise<ComparisonVariant[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/compare?variants=${variantIds.join(',')}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      const data = await response.json();
      return data.success ? data.data.variants : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveComparison = async (variantIds: string[], userId: string | null = null) => {
    try {
      const response = await fetch('/api/compare/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          variantIds
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save comparison');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    }
  };

  return {
    compareVariants,
    saveComparison,
    loading,
    error
  };
};