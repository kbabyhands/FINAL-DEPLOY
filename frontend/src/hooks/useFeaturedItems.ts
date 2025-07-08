import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MenuItem } from "@/data/placeholderMenuItems";

interface ReviewData {
  menuItemId: string;
  averageRating: number;
  reviewCount: number;
  weightedScore: number;
}

export const useFeaturedItems = () => {
  const [featuredItems, setFeaturedItems] = useState<(MenuItem & { reviewCount: number; averageRating: number; weightedScore: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Bayesian Average calculation for weighted scoring
  // This balances average rating with review count reliability
  const calculateWeightedScore = (averageRating: number, reviewCount: number): number => {
    const globalAverageRating = 4.0; // Assumed global average (can be calculated from all reviews)
    const minimumReviewsForReliability = 5; // Minimum reviews needed for full weight
    
    // Bayesian Average formula: ((v * R) + (m * C)) / (v + m)
    // where v = number of reviews, R = average rating, m = minimum reviews, C = global average
    const weightedScore = ((reviewCount * averageRating) + (minimumReviewsForReliability * globalAverageRating)) / 
                         (reviewCount + minimumReviewsForReliability);
    
    return weightedScore;
  };

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        // Get all reviews with ratings
        const { data: reviews, error: reviewError } = await supabase
          .from('menu_item_reviews')
          .select('menu_item_id, rating');

        if (reviewError) throw reviewError;

        if (!reviews || reviews.length === 0) {
          setFeaturedItems([]);
          return;
        }

        // Calculate review statistics per menu item
        const reviewStats: { [key: string]: ReviewData } = {};
        
        reviews.forEach(review => {
          const menuItemId = review.menu_item_id;
          
          if (!reviewStats[menuItemId]) {
            reviewStats[menuItemId] = {
              menuItemId,
              averageRating: 0,
              reviewCount: 0,
              weightedScore: 0
            };
          }
          
          reviewStats[menuItemId].reviewCount++;
        });

        // Calculate average ratings
        Object.keys(reviewStats).forEach(menuItemId => {
          const itemReviews = reviews.filter(r => r.menu_item_id === menuItemId);
          const totalRating = itemReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / itemReviews.length;
          
          reviewStats[menuItemId].averageRating = averageRating;
          reviewStats[menuItemId].weightedScore = calculateWeightedScore(
            averageRating, 
            reviewStats[menuItemId].reviewCount
          );
        });

        // Get menu items that have reviews
        const itemsWithReviews = Object.keys(reviewStats);
        
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
          // Combine menu items with review statistics and sort by weighted score
          const featuredItemsData = menuItems
            .map(item => ({
              ...item,
              reviewCount: reviewStats[item.id]?.reviewCount || 0,
              averageRating: reviewStats[item.id]?.averageRating || 0,
              weightedScore: reviewStats[item.id]?.weightedScore || 0
            }))
            .sort((a, b) => b.weightedScore - a.weightedScore) // Sort by weighted score (highest first)
            .slice(0, 3); // Show top 3 items with best weighted scores

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