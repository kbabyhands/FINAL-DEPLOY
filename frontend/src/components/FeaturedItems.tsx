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
        <div className="container">
          <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }} className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
              <p style={{ color: 'var(--text-secondary)' }} className="body-medium">Loading featured items...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render section if no featured items
  if (featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16" style={{ background: 'var(--bg-section)' }}>
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">
            Featured Items
          </h2>
          <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
            Highest rated dishes
          </p>
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