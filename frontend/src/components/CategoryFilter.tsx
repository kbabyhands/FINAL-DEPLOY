
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_CONFIG } from "@/constants";
import type { CategoryFilterProps } from "@/types";

/**
 * CategoryFilter Component - Dropdown filter for menu categories
 * 
 * Features:
 * - Multi-select support (though currently single-select)
 * - Keyboard navigation
 * - Clear visual feedback for selected categories
 */
const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  // Convert single selection to multi-selection logic for future extensibility
  const selectedCategories = activeCategory === APP_CONFIG.DEFAULT_CATEGORY ? [] : [activeCategory];
  
  /**
   * Handles category toggle - currently supports single selection
   * Can be extended to support multi-selection in the future
   */
  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === APP_CONFIG.DEFAULT_CATEGORY) {
      onCategoryChange(APP_CONFIG.DEFAULT_CATEGORY);
    } else {
      onCategoryChange(categoryId);
    }
  };

  /**
   * Gets display names for active categories
   */
  const getActiveCategoryNames = (): string[] => {
    if (selectedCategories.length > 0) {
      return categories
        .filter(cat => selectedCategories.includes(cat.id))
        .map(cat => cat.name);
    }
    return ['All'];
  };

  const activeCategoryNames = getActiveCategoryNames();

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-amber-800 whitespace-nowrap">
        Category:
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white/80 border-amber-200 hover:bg-amber-50 text-amber-900 shadow-sm rounded-xl px-4 py-2 font-medium transition-all duration-200"
            aria-label="Select category filter"
          >
            <span className="text-sm">
              {activeCategoryNames.length > 0 
                ? activeCategoryNames.join(', ')
                : 'All Categories'
              }
            </span>
            <ChevronDown className="h-4 w-4 ml-2 text-amber-600" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-amber-200 rounded-xl shadow-xl" align="start">
          <DropdownMenuLabel className="text-amber-800 font-medium px-4 py-3">
            Choose Category
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-amber-200" />
          
          <div className="p-2 space-y-1" role="group" aria-label="Category options">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center space-x-3 p-3 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors duration-150"
                onClick={() => handleCategoryToggle(category.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoryToggle(category.id);
                  }
                }}
              >
                <Checkbox
                  id={category.id}
                  checked={activeCategory === category.id}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                  aria-label={`Filter by ${category.name}`}
                  className="border-amber-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <label 
                  htmlFor={category.id} 
                  className="text-sm cursor-pointer flex-1 flex items-center text-amber-900 font-medium"
                >
                  <span className="mr-2 text-amber-600 dark:text-amber-400" aria-hidden="true">{category.icon}</span>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CategoryFilter;
