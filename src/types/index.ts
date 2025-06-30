
// Shared type definitions for the restaurant menu application

export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  allergens: string[];
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_nut_free: boolean;
  image_url?: string;
  model_url?: string;
  is_active: boolean;
  restaurant_id: string;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  background_color?: string;
  background_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  address?: string;
  phone?: string;
  email?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemReview {
  id: string;
  menu_item_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemView {
  id: string;
  menu_item_id: string;
  user_session?: string;
  ip_address?: string;
  viewed_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface DietaryFilters {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  nutFree: boolean;
}

// Form interfaces
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
  is_active: boolean;
}

export interface RestaurantFormData {
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  background_color?: string;
  background_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

// Utility types
export type SortField = 'title' | 'price' | 'category' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
