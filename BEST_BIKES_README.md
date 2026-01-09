# Best Bikes Feature

This feature implements a "Best Value Bikes" page that shows motorcycles matching specific criteria for optimal value proposition.

## Features

- **Smart Filtering**: Filters bikes based on price (₹2,00,000 - ₹3,00,000), engine displacement (250cc-350cc), and fuel efficiency (40+ kmpl)
- **Responsive UI**: Modern, mobile-friendly interface with cards layout
- **Real-time Data**: Fetches data from the database using the custom SQL query
- **Performance Optimized**: Uses efficient database queries and optional SQL functions
- **Navigation Integration**: Accessible via the main navigation under BIKES > Best Bikes

## Files Created

### API Endpoint
- `app/api/best-bikes/route.ts` - REST API endpoint that implements the filtering logic

### Frontend Page
- `app/bikes/best/page.tsx` - React component displaying the filtered bikes with modern UI

### Database
- `sql-queries/best-bikes-function.sql` - Optional SQL function for better performance

### Testing
- `test-best-bikes-api.js` - Comprehensive test script for the database queries and API
- `quick-test-api.js` - Simple API test for quick verification

## URL Structure

The page is accessible at `/bikes/best` which follows the site's URL convention and is integrated into the navigation:

- **Frontend Page**: `/bikes/best`
- **API Endpoint**: `/api/best-bikes`
- **Navigation**: BIKES → Best Bikes → All Best Bikes

## SQL Query Used

The feature uses this SQL query to find the best value bikes:

```sql
SELECT
  b.brand_name,
  m.model_name,
  v.variant_name,
  v.on_road_price,
  s.displacement,
  s.city_mileage
FROM variants v
JOIN specs s ON v.variant_id = s.variant_id
JOIN models m ON v.model_id = m.model_id
JOIN brands b ON v.brand_id = b.brand_id
WHERE
  v.on_road_price BETWEEN 200000 AND 300000
  AND (
    NULLIF(regexp_replace(s.displacement, '[^0-9]', '', 'g'), '')::int
  ) BETWEEN 250 AND 350
  AND (
    NULLIF(regexp_replace(s.city_mileage, '[^0-9]', '', 'g'), '')::int
  ) > 40
ORDER BY v.on_road_price ASC;
```

## Usage

### Access the Page
Navigate to `/bikes/best` to see the filtered bikes. The page is also accessible through the main navigation:
- **Desktop**: BIKES → Best Bikes → All Best Bikes
- **Mobile**: Menu → BIKES → Best Bikes → All Best Bikes

### API Endpoint
```
GET /api/best-bikes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "brand_name": "Royal Enfield",
      "model_name": "Meteor 350",
      "variant_name": "Fireball",
      "on_road_price": 232980,
      "displacement": "349 cc",
      "city_mileage": "41.88 kmpl"
    }
  ],
  "total": 15,
  "criteria": {
    "priceRange": "₹2,00,000 - ₹3,00,000",
    "displacement": "250cc - 350cc",
    "minMileage": "40+ kmpl"
  }
}
```

## Testing

Run the test scripts to verify functionality:

```bash
# Test database queries and API
node test-best-bikes-api.js

# Quick API test (requires server running)
node quick-test-api.js
```

## Performance Optimization

For better performance, you can create the SQL function in your Supabase database:

1. Go to Supabase SQL Editor
2. Run the contents of `sql-queries/best-bikes-function.sql`
3. The API will automatically use the RPC function if available

## Selection Criteria

The "Best Value Bikes" are selected based on:

- **Price Range**: ₹2,00,000 - ₹3,00,000 (good value segment)
- **Engine Size**: 250cc - 350cc (optimal for Indian roads)
- **Fuel Efficiency**: 40+ kmpl (economical for daily use)
- **Sorting**: Sorted by price (ascending) for best deals first

This criteria ensures the bikes offer the best balance of performance, affordability, and fuel economy for everyday riders.