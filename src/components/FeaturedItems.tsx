import React from "react";
import { Star } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useFeaturedItems } from "@/hooks/useFeaturedItems";

const FeaturedItems = () => {
  const { featuredItems, loading } = useFeaturedItems();

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (featuredItems.length === 0) {
    return null; // Don't show section if no featured items
  }

  return (
    <div className="py-8 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 mb-6">
          <Star className="w-6 h-6 text-primary fill-primary" />
          <h2 className="text-2xl font-bold text-foreground">Featured Items</h2>
          <span className="text-sm text-muted-foreground">Most reviewed dishes</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <div key={item.id} className="relative">
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
                />
              </div>
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-background">
                ⭐ {item.reviewCount} reviews
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedItems;