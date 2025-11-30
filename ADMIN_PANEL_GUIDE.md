# BikersAlliance Admin Panel - Production Ready Implementation Guide

## 🚀 Overview

This is a comprehensive Admin Panel for the BikersAlliance website built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. The panel provides complete CRUD operations for managing brands, models, variants, bookings, users, and more.

## 📋 Features Implemented

✅ **Authentication System**
- JWT-based admin authentication
- Role-based access control (super_admin, admin, editor)
- Secure login/logout functionality
- Password hashing with bcrypt

✅ **Dashboard Pages**
- Main dashboard with KPIs and analytics
- Brands management (CRUD operations)
- Models management with brand relationships
- Variants management with image uploads
- Specifications editor with JSON support
- Status & Launch management
- Bookings overview and management
- Reviews moderation
- User management
- Image gallery manager
- Newsletter management
- Admin settings

✅ **Core Components**
- Responsive sidebar navigation
- Data tables with pagination, search, and sorting
- File upload components for images
- Form components with validation
- Stats cards and activity feeds

## 🗄️ Database Schema

### Admin Table
```sql
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

### Audit Log Table
```sql
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 API Endpoints

### Authentication Endpoints

#### POST `/api/admin/login`
**Purpose**: Admin login with email/password
```typescript
// Request Body
{
  "email": "admin@bikersalliance.com",
  "password": "admin123!"
}

// Response
{
  "success": true,
  "admin": {
    "id": "uuid",
    "name": "Admin Name",
    "email": "admin@bikersalliance.com",
    "role": "super_admin"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/admin/verify-token`
**Purpose**: Verify JWT token validity
```typescript
// Headers
Authorization: Bearer <jwt_token>

// Response
{
  "success": true,
  "admin": {
    "id": "uuid",
    "email": "admin@bikersalliance.com",
    "role": "super_admin"
  }
}
```

### Data Management Endpoints

#### GET `/api/admin/brands`
**Purpose**: List brands with pagination and search
```typescript
// Query Parameters
?page=1&limit=10&search=honda

// Response
{
  "success": true,
  "brands": [
    {
      "brand_id": "uuid",
      "brand_name": "Honda",
      "logo_url": "https://storage.url/honda-logo.jpg",
      "country": "Japan",
      "description": "Honda Motor Company",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### POST `/api/admin/brands`
**Purpose**: Create new brand
```typescript
// Request Body
{
  "brand_name": "New Brand",
  "logo_url": "https://storage.url/logo.jpg",
  "country": "India",
  "description": "Brand description"
}

// Response
{
  "success": true,
  "brand": {
    "brand_id": "new_uuid",
    "brand_name": "New Brand",
    "logo_url": "https://storage.url/logo.jpg",
    "country": "India",
    "description": "Brand description",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### GET `/api/admin/dashboard-stats`
**Purpose**: Get dashboard statistics
```typescript
// Response
{
  "success": true,
  "stats": {
    "totalBrands": 45,
    "totalModels": 250,
    "totalVariants": 500,
    "totalBookings": 1200,
    "totalUsers": 5000,
    "monthlyGrowth": 15
  }
}
```

## 🖼️ File Upload Implementation

### Image Upload Component
```typescript
import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export function ImageUpload({ bucket, onUpload }: { bucket: string, onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${bucket}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('bikeralliance')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('bikeralliance')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-component">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

### Multi-file Upload for Variants
```typescript
const uploadVariantImages = async (variantId: string, files: File[]) => {
  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${variantId}/${Date.now()}-${index}-${file.name}`;
    const filePath = `variant_image/${fileName}`;

    const { data, error } = await supabase.storage
      .from('bikeralliance')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('bikeralliance')
      .getPublicUrl(filePath);

    // Save to images table
    await supabase.from('images').insert({
      variant_id: variantId,
      url: publicUrl,
      alt_text: `${file.name} image`
    });

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};
```

## 🛡️ Security Implementation

### Row Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admins can manage brands" ON brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin 
            WHERE id = auth.uid()::uuid 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can manage models" ON models
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin 
            WHERE id = auth.uid()::uuid 
            AND is_active = true
        )
    );
```

### JWT Token Verification
```typescript
import jwt from 'jsonwebtoken';

const verifyAdminToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as any;
    return { success: true, admin: decoded };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
};
```

## 🏗️ Project Structure

```
app/
├── admin/
│   ├── layout.tsx                 # Admin layout with auth provider
│   ├── login/
│   │   └── page.tsx              # Admin login page
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   ├── brands/
│   │   ├── page.tsx              # Brands list
│   │   ├── new/
│   │   │   └── page.tsx          # Create brand
│   │   └── [id]/
│   │       ├── page.tsx          # View brand
│   │       └── edit/
│   │           └── page.tsx      # Edit brand
│   └── ...other admin pages
├── api/
│   └── admin/
│       ├── login/
│       │   └── route.ts          # Admin login API
│       ├── verify-token/
│       │   └── route.ts          # Token verification
│       ├── brands/
│       │   ├── route.ts          # Brands CRUD
│       │   └── [id]/
│       │       └── route.ts      # Single brand operations
│       └── ...other API routes

components/
├── admin/
│   ├── AdminSidebar.tsx          # Navigation sidebar
│   ├── AdminHeader.tsx           # Top header
│   ├── DataTable.tsx             # Reusable data table
│   ├── StatsCard.tsx             # Dashboard stats cards
│   ├── RecentActivity.tsx        # Activity feed
│   └── ...other admin components

context/
└── AdminAuthContext.tsx          # Admin authentication context

sql-schemas/
└── admin_schema.sql              # Database schema
```

## 🔧 Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin JWT Secret
ADMIN_JWT_SECRET=your-super-secret-admin-key-change-in-production

# Optional: Admin Email Settings
ADMIN_EMAIL_FROM=admin@bikersalliance.com
ADMIN_EMAIL_REPLY_TO=noreply@bikersalliance.com
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Admin user created with hashed password
- [ ] Storage buckets configured with proper policies
- [ ] CORS settings configured for your domain

### Security Checklist
- [ ] JWT secret is strong and unique
- [ ] Admin passwords are hashed with bcrypt
- [ ] RLS policies are enabled and tested
- [ ] File upload size limits configured
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production

### Performance Checklist
- [ ] Database indexes created
- [ ] Image compression enabled
- [ ] CDN configured for static assets
- [ ] Pagination implemented for large datasets
- [ ] Database connection pooling configured

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication
- [ ] Admin can login with valid credentials
- [ ] Invalid credentials are rejected
- [ ] JWT token expires after 24 hours
- [ ] Logout clears session properly

#### Brand Management
- [ ] Can create new brand with image upload
- [ ] Can edit existing brand
- [ ] Can delete brand (with confirmation)
- [ ] Search and pagination work correctly
- [ ] Images display properly

#### File Upload
- [ ] Single image upload works
- [ ] Multiple image upload works
- [ ] Large files are rejected
- [ ] Invalid file types are rejected
- [ ] Images are accessible via public URL

#### Data Integrity
- [ ] Foreign key constraints work
- [ ] Required fields validation
- [ ] Duplicate prevention works
- [ ] Audit logs are created

## 📈 Monitoring & Maintenance

### Key Metrics to Monitor
- Admin login success/failure rates
- API response times
- Database query performance
- Storage usage and costs
- Error rates and exceptions

### Regular Maintenance Tasks
- Review audit logs monthly
- Clean up unused images quarterly
- Update dependencies regularly
- Backup database weekly
- Monitor storage costs

## 🔧 Troubleshooting

### Common Issues

**Authentication Not Working**
- Check JWT secret in environment variables
- Verify Supabase credentials
- Check browser local storage for tokens

**Images Not Uploading**
- Verify storage bucket policies
- Check file size limits
- Ensure CORS is configured properly

**Database Errors**
- Check RLS policies
- Verify connection strings
- Review database logs

## 📞 Support & Resources

- **Documentation**: `/docs/admin-panel.md`
- **API Reference**: `/docs/api-reference.md`
- **Component Library**: `/docs/components.md`
- **Deployment Guide**: `/docs/deployment.md`

---

**Note**: This admin panel is production-ready but should be customized according to your specific requirements. Always test thoroughly in a staging environment before deploying to production.