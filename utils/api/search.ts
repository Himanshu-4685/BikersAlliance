export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'brand' | 'model' | 'variant' | 'category';
  category?: string;
  brandName?: string;
  href: string;
  description?: string;
}

export interface SearchResult {
  suggestions: SearchSuggestion[];
  results: {
    bikes: Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      brand: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
}

// Vehicle categories that combine with brands
export const VEHICLE_CATEGORIES = [
  { id: 'bikes', name: 'Bikes', slug: 'bikes' },
  { id: 'scooters', name: 'Scooters', slug: 'scooters' },
  { id: 'electric', name: 'Electric', slug: 'electric' },
  { id: 'sports', name: 'Sports', slug: 'sports' },
  { id: 'cruiser', name: 'Cruiser', slug: 'cruiser' },
  { id: 'commuter', name: 'Commuter', slug: 'commuter' },
];

/**
 * Fetch search suggestions and results
 */
export async function getSearchResults(query: string): Promise<SearchResult> {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || { suggestions: [], results: { bikes: [] } };
  } catch (error) {
    console.error('Error fetching search results:', error);
    return { suggestions: [], results: { bikes: [] } };
  }
}

/**
 * Get search suggestions for a query
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  try {
    // Allow single character searches for better UX
    if (!query || query.length < 1) {
      return [];
    }

    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search suggestions failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
}

/**
 * Generate brand-category combinations for suggestions
 */
export function generateBrandCategorySuggestions(
  brandName: string, 
  brandSlug: string,
  query: string
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  
  // Filter categories that make sense for the search query
  const relevantCategories = VEHICLE_CATEGORIES.filter(category => {
    const searchTerm = query.toLowerCase();
    const brandLower = brandName.toLowerCase();
    const categoryLower = category.name.toLowerCase();
    
    // Include if query matches brand and category, or just category
    return (
      searchTerm.includes(brandLower) ||
      searchTerm.includes(categoryLower) ||
      brandLower.includes(searchTerm) ||
      categoryLower.includes(searchTerm)
    );
  });

  // Generate suggestions like "KTM Bikes", "KTM Scooters", etc.
  relevantCategories.forEach(category => {
    suggestions.push({
      id: `${brandSlug}-${category.slug}`,
      title: `${brandName} ${category.name}`,
      type: 'category',
      category: category.name,
      brandName: brandName,
      href: `/bikes?brand=${brandSlug}&category=${category.slug}`,
      description: `Explore ${brandName} ${category.name.toLowerCase()}`
    });
  });

  return suggestions;
}

/**
 * Helper function to create a slug from text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}