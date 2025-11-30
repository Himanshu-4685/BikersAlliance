// Test the clean bike name function
function cleanBikeName(modelName, variantName, brandName) {
  if (!modelName || !variantName) return 'Unknown';
  
  // If variant name already contains the full model name, just use variant name
  if (variantName.toLowerCase().includes(modelName.toLowerCase())) {
    return variantName;
  }
  
  // If variant name starts with brand name and model already has brand name, remove brand from variant
  if (brandName && variantName.toLowerCase().startsWith(brandName.toLowerCase()) && 
      modelName.toLowerCase().includes(brandName.toLowerCase())) {
    const cleanVariantName = variantName.replace(new RegExp(`^${brandName}\\s*`, 'i'), '').trim();
    return `${modelName} ${cleanVariantName}`;
  }
  
  // Default: combine model and variant
  return `${modelName} ${variantName}`;
}

// Test cases from the actual data
const testCases = [
  { brand: 'Benelli', model: 'Benelli Imperiale', variant: 'Benelli Imperiale 400 Silver' },
  { brand: 'Benelli', model: 'Benelli TRK', variant: 'Benelli TRK 502 X' },
  { brand: 'Honda', model: 'Honda Activa', variant: '6G' },
  { brand: 'Hero', model: 'Splendor', variant: 'Plus' }
];

console.log('Testing bike name cleaning:');
testCases.forEach(test => {
  const result = cleanBikeName(test.model, test.variant, test.brand);
  console.log(`Brand: ${test.brand}, Model: ${test.model}, Variant: ${test.variant}`);
  console.log(`Result: ${result}`);
  console.log('---');
});