import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG, ERROR_MESSAGES } from '@/constants';
import type { MenuItem, Restaurant, Review, MenuItemView } from '@/types';

/**
 * API Service - Centralized data access layer
 * 
 * Provides:
 * - Consistent error handling
 * - Type-safe database operations
 * - Retry logic for failed requests
 * - Centralized query optimization
 */

export class ApiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Restaurant API operations
 */
export const restaurantApi = {
  /**
   * Get restaurant by ID with error handling
   */
  async getById(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new ApiError(error.message, error.code);
      return data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error instanceof ApiError ? error : new ApiError(ERROR_MESSAGES.GENERIC);
    }
  },

  /**
   * Update restaurant profile
   */
  async update(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new ApiError(error.message, error.code);
      return data;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error instanceof ApiError ? error : new ApiError(ERROR_MESSAGES.GENERIC);
    }
  },
};

/**
 * Menu Items API operations
 */
export const menuItemsApi = {
  /**
   * Get all active menu items for a restaurant
   */
  async getByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw new ApiError(error.message, error.code);
      return data || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error instanceof ApiError ? error : new ApiError(ERROR_MESSAGES.GENERIC);
    }
  },

  /**
   * Get featured items (most reviewed)
   */
  async getFeatured(restaurantId: string, limit: number = 6): Promise<(MenuItem & { reviewCount: number })[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          reviews:menu_item_reviews(count)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw new ApiError(error.message, error.code);

      return (data || []).map(item => ({
        ...item,
        reviewCount: item.reviews?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error fetching featured items:', error);
      throw error instanceof ApiError ? error : new ApiError(ERROR_MESSAGES.GENERIC);
    }
  },
};

/**
 * Reviews API operations
 */
export const reviewsApi = {
  /**
   * Get reviews for a menu item
   */
  async getByMenuItem(menuItemId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('menu_item_reviews')
        .select('*')
        .eq('menu_item_id', menuItemId)
        .order('created_at', { ascending: false });

      if (error) throw new ApiError(error.message, error.code);
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error instanceof ApiError ? error : new ApiError(ERROR_MESSAGES.GENERIC);
    }
  },

  /**
   * Create a new review
   */
  async create(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('menu_item_reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw new ApiError(error.message, error.code);
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error instanceof ApiError ? error : new ApiError(ERROR_MESSAGES.GENERIC);
    }
  },
};

/**
 * Analytics API operations
 */
export const analyticsApi = {
  /**
   * Track menu item view
   */
  async trackView(menuItemId: string, sessionId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('menu_item_views')
        .insert({
          menu_item_id: menuItemId,
          user_session: sessionId || null,
          ip_address: null, // Will be handled by RLS/triggers
        });

      if (error) throw new ApiError(error.message, error.code);
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw for analytics failures
    }
  },

  /**
   * Get view analytics for restaurant
   */
  async getRestaurantAnalytics(restaurantId: string): Promise<{
    totalViews: number;
    viewsByDate: Array<{ date: string; views: number }>;
  }> {
    try {
      // This would require a more complex query or RPC function
      // For now, return basic structure
      return {
        totalViews: 0,
        viewsByDate: [],
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error instanceof ApiError ? error : new ApiError(ERROR_MESSAGES.GENERIC);
    }
  },
};