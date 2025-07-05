import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MenuItem, placeholderMenuItems } from "@/data/placeholderMenuItems";
import { getCategoryIcon } from "@/utils/categoryIcons";

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
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const useMenuData = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All", icon: "🍽️" }
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      // Load restaurant branding data
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .single();

      if (restaurantError && restaurantError.code !== 'PGRST116') {
        console.log('Restaurant not found, using defaults');
      } else {
        setRestaurant(restaurantData);
      }

      // Load menu items
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Use placeholder items if no real items exist
      const itemsToShow = data && data.length > 0 ? data : placeholderMenuItems;
      setMenuItems(itemsToShow);
      
      // Extract unique categories and create category filter options
      const uniqueCategories = [...new Set(itemsToShow.map(item => item.category))];
      const categoryOptions = [
        { id: "all", name: "All", icon: "🍽️" },
        ...uniqueCategories.map(category => ({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: getCategoryIcon(category)
        }))
      ];
      setCategories(categoryOptions);
    } catch (error: any) {
      toast({
        title: "Error loading menu",
        description: error.message,
        variant: "destructive"
      });
      // Fall back to placeholder items on error
      setMenuItems(placeholderMenuItems);
      const uniqueCategories = [...new Set(placeholderMenuItems.map(item => item.category))];
      const categoryOptions = [
        { id: "all", name: "All", icon: "🍽️" },
        ...uniqueCategories.map(category => ({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: getCategoryIcon(category)
        }))
      ];
      setCategories(categoryOptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    menuItems,
    restaurant,
    categories,
    loading
  };
};