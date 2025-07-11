import { useEffect } from "react";
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

  // Update document meta tags when restaurant data loads
  useEffect(() => {
    if (restaurant) {
      // Update page title
      document.title = `${restaurant.name} - Digital Menu`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `Explore ${restaurant.name}'s interactive digital menu. ${restaurant.description || 'Delicious food with 3D models, dietary filters, and detailed information.'}`
        );
      }
      
      // Update Open Graph title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${restaurant.name} - Digital Menu`);
      }
      
      // Update Open Graph description
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', 
          `Explore ${restaurant.name}'s interactive digital menu. ${restaurant.description || 'Delicious food with 3D models, dietary filters, and detailed information.'}`
        );
      }

      // Update Twitter title
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `${restaurant.name} - Digital Menu`);
      }

      // Update Twitter description
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', 
          `Explore ${restaurant.name}'s interactive digital menu. ${restaurant.description || 'Delicious food with 3D models, dietary filters, and detailed information.'}`
        );
      }
    } else {
      // Fallback title when no restaurant data
      document.title = "Digital Menu - Interactive Restaurant Menu";
    }
  }, [restaurant]);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }} className="body-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <MenuHeader restaurant={restaurant} />

      {/* Featured Items Section */}
      <FeaturedItems />

      {/* Main Menu Section */}
      <section className="py-16" style={{ background: 'var(--bg-card)' }}>
        {/* Filters Section */}
        <div className="sticky top-0 z-40 py-6 mb-8" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
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
        </div>

        {/* Menu Grid */}
        <MenuGrid 
          filteredItems={filteredItems}
          totalItemsCount={menuItems.length}
        />
      </section>
    </div>
  );
};

export default Index;