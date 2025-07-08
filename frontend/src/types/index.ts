// Core data types
export interface MenuItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  allergens: string[];
  is_vegetarian: boolean | null;
  is_vegan: boolean | null;
  is_gluten_free: boolean | null;
  is_nut_free: boolean | null;
  is_active: boolean | null;
  image_url: string | null;
  model_url: string | null;
  restaurant_id: string;
  view_count: number | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  banner_url: string | null;
  background_image_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  background_color: string | null;
  font_family: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  menu_item_id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItemView {
  id: string;
  menu_item_id: string;
  ip_address: string | null;
  user_session: string | null;
  viewed_at: string;
}

// Filter types
export interface DietaryFilters {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  nutFree: boolean;
}

export interface FilterState {
  activeCategory: string;
  dietaryFilters: DietaryFilters;
  searchQuery?: string;
}

// Component props types
export interface MenuCardProps {
  menuItemId: string;
  title: string;
  description: string;
  price: number;
  allergens: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
  imageUrl?: string;
  splatUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  size?: 'regular' | 'featured';
}

export interface DietaryBadgesProps {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
  variant?: 'compact' | 'detailed';
}

export interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export interface DietaryFilterProps {
  filters: DietaryFilters;
  onFilterChange: (filter: string, value: boolean) => void;
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'owner';
}

export interface AnalyticsData {
  totalViews: number;
  totalReviews: number;
  averageRating: number;
  topItems: MenuItem[];
  viewsByDate: Array<{
    date: string;
    views: number;
  }>;
  reviewsByRating: Array<{
    rating: number;
    count: number;
  }>;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Performance and device detection
export interface DeviceCapabilities {
  isMobile: boolean;
  hasLowMemory: boolean;
  hasSlowConnection: boolean;
  performanceMode: boolean;
}

// Form types
export interface ReviewFormData {
  customerName: string;
  customerEmail?: string;
  rating: number;
  reviewText?: string;
}

export interface MenuItemFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  allergens: string[];
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_nut_free: boolean;
  image_url?: string;
  model_url?: string;
}

export interface RestaurantFormData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  font_family?: string;
}