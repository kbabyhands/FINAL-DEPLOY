
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
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        Category:
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-48 justify-between"
            aria-label="Select category filter"
          >
            <span>
              {activeCategoryNames.length > 0 
                ? activeCategoryNames.join(', ')
                : 'Select categories'
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-2 space-y-2" role="group" aria-label="Category options">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center space-x-3 p-2 hover:bg-muted rounded-sm cursor-pointer"
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
                />
                <label 
                  htmlFor={category.id} 
                  className="text-sm cursor-pointer flex-1 flex items-center"
                >
                  <span className="mr-2" aria-hidden="true">{category.icon}</span>
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
