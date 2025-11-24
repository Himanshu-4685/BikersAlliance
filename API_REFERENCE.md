# Admin Panel API Reference

## Authentication

### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@bikersalliance.com",
  "password": "admin123!"
}
```

**Response**:
```json
{
  "success": true,
  "admin": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Super Admin",
    "email": "admin@bikersalliance.com",
    "role": "super_admin",
    "is_active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Token Verification
```http
POST /api/admin/verify-token
Authorization: Bearer <jwt_token>
```

### Logout
Client-side operation - remove token from localStorage

---

## Brands Management

### List Brands
```http
GET /api/admin/brands?page=1&limit=10&search=honda
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "brands": [
    {
      "brand_id": "550e8400-e29b-41d4-a716-446655440000",
      "brand_name": "Honda",
      "logo_url": "https://storage.supabase.co/honda-logo.jpg",
      "country": "Japan",
      "description": "Honda Motor Company",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### Create Brand
```http
POST /api/admin/brands
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "brand_name": "New Brand",
  "logo_url": "https://storage.supabase.co/new-brand-logo.jpg",
  "country": "India",
  "description": "Brand description"
}
```

### Get Single Brand
```http
GET /api/admin/brands/[brand_id]
Authorization: Bearer <jwt_token>
```

### Update Brand
```http
PUT /api/admin/brands/[brand_id]
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "brand_name": "Updated Brand Name",
  "country": "Updated Country"
}
```

### Delete Brand
```http
DELETE /api/admin/brands/[brand_id]
Authorization: Bearer <jwt_token>
```

---

## Models Management

### List Models
```http
GET /api/admin/models?page=1&limit=10&brand_id=uuid
Authorization: Bearer <jwt_token>
```

### Create Model
```http
POST /api/admin/models
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "model_name": "CBR 650R"
}
```

---

## Variants Management

### List Variants
```http
GET /api/admin/variants?page=1&limit=10&model_id=uuid
Authorization: Bearer <jwt_token>
```

### Create Variant
```http
POST /api/admin/variants
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "model_id": "550e8400-e29b-41d4-a716-446655440000",
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "variant_name": "CBR 650R Standard",
  "on_road_price": 850000,
  "url": "/bikes/honda/cbr-650r/standard"
}
```

### Upload Variant Images
```http
POST /api/admin/variants/[variant_id]/images
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

files: [File, File, ...]
```

---

## Specifications Management

### Get Variant Specs
```http
GET /api/admin/specs/[variant_id]
Authorization: Bearer <jwt_token>
```

### Update Variant Specs
```http
PUT /api/admin/specs/[variant_id]
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "engine_type": "4-Stroke, DOHC",
  "displacement": "649cc",
  "max_power": "94 BHP",
  "max_torque": "64 Nm",
  "other_features": {
    "abs": true,
    "traction_control": true,
    "riding_modes": ["Sport", "Rain", "Road"]
  }
}
```

---

## Status & Launch Management

### List Status Records
```http
GET /api/admin/status?page=1&limit=10
Authorization: Bearer <jwt_token>
```

### Update Launch Status
```http
PUT /api/admin/status/[status_id]
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "new_launch",
  "price_range": "₹8.5L - ₹9.5L",
  "launch_date": "2024-06-15T00:00:00Z"
}
```

---

## Bookings Management

### List Bookings
```http
GET /api/admin/bookings?page=1&limit=10&status=pending
Authorization: Bearer <jwt_token>
```

### Update Booking Status
```http
PUT /api/admin/bookings/[booking_id]
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Booking confirmed, customer contacted"
}
```

---

## Users Management

### List Users
```http
GET /api/admin/users?page=1&limit=10&search=john
Authorization: Bearer <jwt_token>
```

### Ban/Unban User
```http
PUT /api/admin/users/[user_id]/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "is_active": false,
  "reason": "Spam activity detected"
}
```

---

## Reviews Management

### List Reviews
```http
GET /api/admin/reviews?page=1&limit=10&status=pending
Authorization: Bearer <jwt_token>
```

### Moderate Review
```http
PUT /api/admin/reviews/[review_id]
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "approved",
  "moderator_notes": "Review approved after verification"
}
```

---

## Image Management

### List Images
```http
GET /api/admin/images?page=1&limit=20&bucket=variant_image
Authorization: Bearer <jwt_token>
```

### Delete Image
```http
DELETE /api/admin/images
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bucket": "variant_image",
  "file_path": "variant_image/uuid/image.jpg"
}
```

---

## Newsletter Management

### List Subscribers
```http
GET /api/admin/newsletter?page=1&limit=10&status=active
Authorization: Bearer <jwt_token>
```

### Export Subscribers
```http
GET /api/admin/newsletter/export?format=csv
Authorization: Bearer <jwt_token>
```

### Update Subscription Status
```http
PUT /api/admin/newsletter/[subscription_id]
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "unsubscribed"
}
```

---

## Dashboard Analytics

### Get Dashboard Stats
```http
GET /api/admin/dashboard-stats
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalBrands": 45,
    "totalModels": 250,
    "totalVariants": 500,
    "totalBookings": 1200,
    "totalUsers": 5000,
    "monthlyGrowth": 15,
    "recentActivity": [
      {
        "action": "CREATE",
        "table_name": "brands",
        "admin_name": "Super Admin",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Get Recent Activity
```http
GET /api/admin/recent-activity?limit=10
Authorization: Bearer <jwt_token>
```

---

## File Upload

### Upload to Storage
```http
POST /api/admin/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

bucket: "Brand_image" | "variant_image" | "Profile_image"
file: File
folder?: string
```

**Response**:
```json
{
  "success": true,
  "url": "https://storage.supabase.co/bucket/path/filename.jpg",
  "path": "Brand_image/uuid/filename.jpg"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "brand_name": "Brand name is required",
    "email": "Invalid email format"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Authentication**: 5 requests per minute per IP
- **Data Operations**: 100 requests per minute per admin
- **File Upload**: 10 uploads per minute per admin
- **Bulk Operations**: 5 requests per minute per admin

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for filtering
- `sort`: Sort field
- `order`: Sort direction (asc/desc)

## Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Tokens expire after 24 hours and need to be refreshed by logging in again.