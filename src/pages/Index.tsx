
import CategoryFilter from "@/components/CategoryFilter";
import DietaryFilter from "@/components/DietaryFilter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MenuHeader } from "@/components/MenuHeader";
import { MenuGrid } from "@/components/MenuGrid";
import FeaturedItems from "@/components/FeaturedItems";
import { useMenuData } from "@/hooks/useMenuData";
import { useMenuFilters } from "@/hooks/useMenuFilters";

const Index = () => {
  const { menuItems, restaurant, categories, loading } = useMenuData();
  const { 
    activeCategory, 
    dietaryFilters, 
    filteredItems, 
    handleCategoryChange, 
    handleFilterChange 
  } = useMenuFilters(menuItems);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader restaurant={restaurant} />

      {/* Featured Items Section */}
      <FeaturedItems />

      {/* Sticky Filters Section */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-7xl mx-auto">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <DietaryFilter
            filters={dietaryFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MenuGrid filteredItems={filteredItems} totalItemsCount={menuItems.length} />
      </div>
    </div>
  );
};

export default Index;
