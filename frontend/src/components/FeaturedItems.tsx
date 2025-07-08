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
    <section className="py-8 bg-muted/30" aria-labelledby="featured-items-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center space-x-2 mb-6">
          <Star className="w-6 h-6 text-primary fill-primary" aria-hidden="true" />
          <h2 id="featured-items-title" className="text-2xl font-bold text-foreground">
            Featured Items
          </h2>
          <span className="text-sm text-muted-foreground">
            Highest rated dishes
          </span>
        </div>
        
        {/* Featured Items Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="grid"
          aria-label="Featured menu items"
        >
          {featuredItems.map((item) => (
            <div key={item.id} className="relative" role="gridcell">
              <div className="bg-card rounded-lg border border-border hover:shadow-lg transition-shadow duration-200">
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
                />
              </div>
              
              {/* Review Count and Rating Badge */}
              <div 
                className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-background"
                aria-label={`${item.averageRating.toFixed(1)} stars, ${item.reviewCount} ${pluralize(item.reviewCount, 'review')}`}
              >
                ⭐ {item.averageRating.toFixed(1)} ({item.reviewCount})
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;