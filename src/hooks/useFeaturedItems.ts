import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MenuItem } from "@/data/placeholderMenuItems";

export const useFeaturedItems = () => {
  const [featuredItems, setFeaturedItems] = useState<(MenuItem & { reviewCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        // First get review counts per menu item
        const { data: reviewCounts, error: reviewError } = await supabase
          .from('menu_item_reviews')
          .select('menu_item_id')
          .then(result => {
            if (result.error) throw result.error;
            
            // Count reviews per menu item
            const counts: { [key: string]: number } = {};
            result.data.forEach(review => {
              counts[review.menu_item_id] = (counts[review.menu_item_id] || 0) + 1;
            });
            
            return { data: counts, error: null };
          });

        if (reviewError) throw reviewError;

        // Get menu items that have reviews
        const itemsWithReviews = Object.keys(reviewCounts || {});
        
        if (itemsWithReviews.length === 0) {
          setFeaturedItems([]);
          return;
        }

        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_active', true)
          .in('id', itemsWithReviews);

        if (menuError) throw menuError;

        if (menuItems) {
          // Combine menu items with review counts and sort
          const featuredItemsData = menuItems
            .map(item => ({
              ...item,
              reviewCount: reviewCounts[item.id] || 0
            }))
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 3); // Show top 3 most reviewed items

          setFeaturedItems(featuredItemsData);
        }
      } catch (error: any) {
        console.error('Error fetching featured items:', error);
        toast({
          title: "Error loading featured items",
          description: error.message,
          variant: "destructive"
        });
        setFeaturedItems([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, [toast]);

  return {
    featuredItems,
    loading
  };
};