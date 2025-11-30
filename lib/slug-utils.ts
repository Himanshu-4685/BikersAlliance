/**
 * Generate a URL-friendly slug from a variant name
 * This should match the slug generation logic in the API routes
 */
export function generateSlug(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}

/**
 * Generate a slug from variant name for bike detail page URLs
 */
export function generateBikeSlug(variantName: string): string {
  return generateSlug(variantName);
}

/**
 * Generate a slug from brand name for brand page URLs
 */
export function generateBrandSlug(brandName: string): string {
  return generateSlug(brandName);
}

/**
 * Clean bike name by removing duplicate brand/model names from variant name
 */
export function cleanBikeName(modelName: string, variantName: string, brandName: string): string {
  if (!variantName) return modelName || brandName || 'Unknown';
  
  // If variant name already contains the model name, use it as is
  if (modelName && variantName.toLowerCase().includes(modelName.toLowerCase())) {
    return variantName;
  }
  
  // If variant name already contains the brand name, use it as is
  if (brandName && variantName.toLowerCase().includes(brandName.toLowerCase())) {
    return variantName;
  }
  
  // Default: combine model and variant
  return `${modelName} ${variantName}`;
}