import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MenuItemReviewData {
  [menuItemId: string]: {
    averageRating: number;
    reviewCount: number;
  };
}

export const useMenuItemReviews = (menuItemIds: string[]) => {
  const [reviewData, setReviewData] = useState<MenuItemReviewData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (menuItemIds.length === 0) {
        setReviewData({});
        setLoading(false);
        return;
      }

      try {
        const { data: reviews, error } = await supabase
          .from('menu_item_reviews')
          .select('menu_item_id, rating')
          .in('menu_item_id', menuItemIds);

        if (error) throw error;

        const reviewStats: MenuItemReviewData = {};

        // Calculate review statistics for each menu item
        menuItemIds.forEach(menuItemId => {
          const itemReviews = reviews?.filter(r => r.menu_item_id === menuItemId) || [];
          
          if (itemReviews.length > 0) {
            const totalRating = itemReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / itemReviews.length;

            reviewStats[menuItemId] = {
              averageRating,
              reviewCount: itemReviews.length
            };
          } else {
            reviewStats[menuItemId] = {
              averageRating: 0,
              reviewCount: 0
            };
          }
        });

        setReviewData(reviewStats);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewData({});
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [menuItemIds]);

  return { reviewData, loading };
};