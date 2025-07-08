import React from "react";
import { Star } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useFeaturedItems } from "@/hooks/useFeaturedItems";
import { pluralize } from "@/utils/formatters";

/**
 * FeaturedItems Component - Displays top-rated menu items
 * 
 * Features:
 * - Shows items with most reviews
 * - Responsive grid layout
 * - Review count badges
 * - Loading and empty states
 */
const FeaturedItems = () => {
  const { featuredItems, loading } = useFeaturedItems();

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Don't render section if no featured items
  if (featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="featured-background py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-light text-foreground mb-2">
            Featured Items
          </h2>
          <span className="text-lg text-muted-foreground">
            Highest rated dishes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {featuredItems.map((item) => (
            <div key={item.id} className="relative" role="gridcell">
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
                averageRating={item.averageRating}
                reviewCount={item.reviewCount}
                size="featured"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;