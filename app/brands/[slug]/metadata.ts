import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase-server';

interface BrandPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = params;
  
  try {
    // Initialize Supabase client
    const supabase = createServerClient();

    // Convert slug to brand name
    const brandName = slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Fetch brand information
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('brand_id, brand_name, logo_url, country')
      .ilike('brand_name', `%${brandName}%`)
      .single();

    if (brandError || !brandData) {
      return {
        title: 'Brand Not Found - BikersAlliance',
        description: 'The requested brand could not be found.',
      };
    }

    // TypeScript assertion: brandData is confirmed to exist at this point
    const brand = brandData as {
      brand_id: string;
      brand_name: string;
      logo_url: string;
      country: string;
    };

    // Clean the brand name
    const cleanBrandName = brand.brand_name.trim();

    // Get bike count for this brand
    const { count: bikeCount } = await supabase
      .from('variants')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brand.brand_id);

    const title = `${cleanBrandName} Bikes - Price, Mileage, Reviews, Specs | BikersAlliance`;
    const description = `Explore ${cleanBrandName} bikes with ${bikeCount || 0} models. Get detailed information about price, mileage, specifications, and reviews for all ${cleanBrandName} motorcycles and scooters.`;

    return {
      title,
      description,
      keywords: [
        `${cleanBrandName} bikes`,
        `${cleanBrandName} motorcycles`,
        `${cleanBrandName} price`,
        `${cleanBrandName} models`,
        'bike specifications',
        'motorcycle reviews',
        'bike price in India',
        'BikersAlliance'
      ].join(', '),
      openGraph: {
        title,
        description,
        images: brand.logo_url ? [brand.logo_url] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: brand.logo_url ? [brand.logo_url] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Brand Bikes - BikersAlliance',
      description: 'Explore bikes from top motorcycle brands with detailed specifications, prices, and reviews.',
    };
  }
}