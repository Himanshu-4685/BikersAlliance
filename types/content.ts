// News Types
export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  category: string;
  publishedAt: string;
  slug: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
}

// Video Types
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  duration: string;
  views: string;
  likes?: string;
  publishedAt: string;
  slug: string;
  category: string;
  channel?: string;
  tags?: string[];
  featured?: boolean;
}

// Web Story Types
export interface StoryPage {
  id: number;
  image: string;
  title: string;
  text: string;
}

export interface WebStory {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  publishedAt: string;
  slug: string;
  category: string;
  pages: StoryPage[] | number; // Can be array of pages or just count
  featured?: boolean;
}

// Common Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component Props Types
export interface GridProps<T> {
  items: T[];
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
}

export interface CardProps<T> {
  item: T;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'featured' | 'compact';
}

// Search and Filter Types
export interface SearchFilters {
  category?: string;
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  author?: string;
  featured?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  filters: SearchFilters;
  totalResults: number;
}

// Content Status Types
export type ContentStatus = 'draft' | 'published' | 'archived' | 'scheduled';

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}