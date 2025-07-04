import { useState } from "react";
import { MenuItem } from "@/data/placeholderMenuItems";

export interface DietaryFilters {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  nutFree: boolean;
}

export const useMenuFilters = (menuItems: MenuItem[]) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutFree: false,
  });

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleFilterChange = (filter: string, value: boolean) => {
    setDietaryFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const filteredItems = menuItems.filter(item => {
    // Category filter
    if (activeCategory !== "all" && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }

    // Dietary filters
    if (dietaryFilters.vegetarian && !item.is_vegetarian) {
      return false;
    }
    if (dietaryFilters.vegan && !item.is_vegan) {
      return false;
    }
    if (dietaryFilters.glutenFree && !item.is_gluten_free) {
      return false;
    }
    if (dietaryFilters.nutFree && !item.is_nut_free) {
      return false;
    }

    return true;
  });

  return {
    activeCategory,
    dietaryFilters,
    filteredItems,
    handleCategoryChange,
    handleFilterChange
  };
};