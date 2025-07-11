import MenuCard from "@/components/MenuCard";
import { EmptyMenuState } from "@/components/EmptyMenuState";
import { useMenuPreloader } from "@/hooks/useMenuPreloader";
import { useMenuItemReviews } from "@/hooks/useMenuItemReviews";
import { MenuItem } from "@/data/placeholderMenuItems";

interface MenuGridProps {
  filteredItems: MenuItem[];
  totalItemsCount: number;
}

/**
 * MenuGrid Component - Displays menu items in a responsive grid layout
 * 
 * Features:
 * - Responsive grid (1 column on mobile, 2 on desktop)
 * - 3D model preloading for performance
 * - Review data integration
 * - Empty state handling
 * - Optimized rendering
 */
export const MenuGrid = ({ filteredItems, totalItemsCount }: MenuGridProps) => {
  // Aggressively preload all 3D models for instant loading
  useMenuPreloader(filteredItems.map(item => ({
    model_url: item.model_url
  })));

  // Fetch review data for all menu items
  const { reviewData, loading: reviewsLoading } = useMenuItemReviews(
    filteredItems.map(item => item.id)
  );

  // Show empty state if no items match filters
  if (filteredItems.length === 0) {
    return <EmptyMenuState hasItems={totalItemsCount > 0} />;
  }

  return (
    <div className="container">
      <div 
        className="scalefast-grid"
        role="grid"
        aria-label={`Menu items grid showing ${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'items'} out of ${totalItemsCount} total`}
      >
        {filteredItems.map((item) => {
          const itemReviews = reviewData[item.id];
          return (
            <div key={item.id} role="gridcell">
              <MenuCard
                menuItemId={item.id}
                title={item.title}
                description={item.description || ''}
                price={item.price}
                allergens={item.allergens}
                isVegetarian={item.is_vegetarian}
                isVegan={item.is_vegan}
                isGlutenFree={item.is_gluten_free}
                isNutFree={item.is_nut_free}
                imageUrl={item.image_url}
                splatUrl={item.model_url}
                averageRating={itemReviews?.averageRating}
                reviewCount={itemReviews?.reviewCount}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};