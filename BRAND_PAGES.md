# Brand Pages Documentation

This documentation covers the dynamic brand page template that displays all bikes from a specific brand.

## Features

### 1. Dynamic Brand Pages (`/brands/[slug]`)
- **URL Pattern**: `/brands/{brand-slug}` (e.g., `/brands/honda`, `/brands/royal-enfield`)
- **Data Source**: Fetches from Supabase database
- **Features**:
  - Brand information with logo, country, and statistics
  - Filterable bike listings with pagination
  - Sorting options (price, name)
  - Grid/List view toggle
  - Price range filtering
  - Responsive design

### 2. Brand Listing Page (`/brands`)
- **URL**: `/brands`
- **Features**:
  - All available brands display
  - Search functionality
  - Brand statistics (model count)
  - Grid/List view toggle
  - Pagination support

## API Endpoints

### 1. Get All Brands
```
GET /api/brands
Query Parameters:
- limit: Number of brands to fetch (default: 50, max: 100)
- offset: Offset for pagination (default: 0)

Response:
{
  "success": true,
  "data": {
    "brands": [
      {
        "id": "brand_id",
        "name": "Brand Name",
        "slug": "brand-slug",
        "logoUrl": "logo_url",
        "country": "Country",
        "_count": {
          "models": 10
        }
      }
    ],
    "pagination": {
      "totalCount": 100,
      "offset": 0,
      "limit": 50
    }
  }
}
```

### 2. Get Brand with Bikes
```
GET /api/brands/[slug]
Query Parameters:
- page: Page number (default: 1)
- limit: Bikes per page (default: 12)
- sortBy: Sort field ('price', 'name') (default: 'price')
- sortOrder: Sort order ('asc', 'desc') (default: 'asc')
- minPrice: Minimum price filter
- maxPrice: Maximum price filter

Response:
{
  "success": true,
  "data": {
    "brand": {
      "id": "brand_id",
      "name": "Brand Name",
      "slug": "brand-slug",
      "logoUrl": "logo_url",
      "country": "Country",
      "stats": {
        "totalModels": 15,
        "totalVariants": 45,
        "priceRange": {
          "min": 50000,
          "max": 500000
        }
      }
    },
    "bikes": [...],
    "pagination": {
      "totalCount": 45,
      "currentPage": 1,
      "totalPages": 4,
      "limit": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Components

### 1. Brand Page Component
- **File**: `app/brands/[slug]/page.tsx`
- **Props**: `{ params: { slug: string } }`
- **Features**:
  - State management for bikes, filters, pagination
  - Brand header with logo and statistics
  - Filter controls (price range, sorting)
  - View mode toggle (grid/list)
  - Pagination controls

### 2. Brands Listing Component
- **File**: `app/brands/page.tsx`
- **Features**:
  - Search functionality
  - Brand grid/list display
  - Pagination
  - Loading states

### 3. Reusable Components

#### LoadingSpinner Component
- **File**: `components/common/LoadingSpinner.tsx`
- **Props**: 
  ```typescript
  {
    size?: 'sm' | 'md' | 'lg',
    className?: string
  }
  ```
- **Usage**: Consistent loading indicator using `loading-red.svg` without animation

#### BikeCard Component
- **File**: `components/bikes/BikeCard.tsx`
- **Props**: 
  ```typescript
  {
    bike: Bike,
    viewMode?: 'grid' | 'list',
    showBrand?: boolean
  }
  ```
- **Usage**: Display individual bike information

#### BrandCard Component
- **File**: `components/bikes/BrandCard.tsx`
- **Props**: 
  ```typescript
  {
    brand: Brand,
    viewMode?: 'grid' | 'list'
  }
  ```
- **Usage**: Display individual brand information

## Database Schema Requirements

The brand pages expect the following database structure:

### Tables Used:
1. **brands** - Brand information
2. **models** - Bike models under each brand
3. **variants** - Specific variants of each model
4. **variant_specs** - Technical specifications for variants

### Key Relationships:
- `brands` → `models` (one-to-many)
- `models` → `variants` (one-to-many)
- `variants` → `variant_specs` (one-to-many)

## Navigation Integration

The brand pages are integrated into the main navigation:
- Header navigation includes "Popular Brands" dropdown
- Links to specific brand pages are pre-configured
- Breadcrumb navigation for easy user orientation

## Styling

- **Framework**: Tailwind CSS
- **Design**: Clean, modern interface
- **Responsive**: Mobile-first approach
- **Icons**: Feather Icons (react-icons/fi)
- **Colors**: Red theme with gray accents

## Performance Considerations

1. **Pagination**: Limits database queries to manageable chunks
2. **Lazy Loading**: Images are optimized with Next.js Image component
3. **Caching**: API responses can be cached at the CDN level
4. **Efficient Queries**: Joins are optimized to fetch required data only

## Future Enhancements

1. **SEO Optimization**: Add meta tags for better search engine visibility
2. **Brand Filters**: Add more filtering options (engine type, price range presets)
3. **Comparison**: Add ability to compare bikes from the brand page
4. **Reviews**: Integrate user reviews and ratings
5. **Wishlist**: Add bikes to wishlist functionality

## Testing

To test the brand pages:

1. **Start the development server**: `npm run dev`
2. **Visit brand listing**: `http://localhost:3000/brands`
3. **Visit specific brand**: `http://localhost:3000/brands/honda`
4. **Test API endpoints**: Use the test file `test-brand-api.js`

## Error Handling

- 404 errors for non-existent brands
- Loading states during data fetching
- Error messages for API failures
- Graceful fallbacks for missing images/data