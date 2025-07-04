
import CategoryFilter from "@/components/CategoryFilter";
import DietaryFilter from "@/components/DietaryFilter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MenuHeader } from "@/components/MenuHeader";
import { MenuGrid } from "@/components/MenuGrid";
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

  const customStyles = restaurant ? {
    backgroundColor: restaurant.background_color || '#f9fafb',
    backgroundImage: restaurant.background_image_url 
      ? `url(${restaurant.background_image_url})` 
      : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: restaurant.font_family || 'Inter'
  } : {};

  return (
    <div 
      className="min-h-screen"
      style={customStyles}
    >
      <MenuHeader restaurant={restaurant} />

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <DietaryFilter
          filters={dietaryFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Menu Grid */}
        <MenuGrid filteredItems={filteredItems} totalItemsCount={menuItems.length} />
      </div>
    </div>
  );
};

export default Index;
