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
      <span className="body-medium font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
        Category:
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="btn-secondary font-medium transition-all duration-200"
            aria-label="Select category filter"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          >
            <span className="text-sm">
              {activeCategoryNames.length > 0 
                ? activeCategoryNames.join(', ')
                : 'All Categories'
              }
            </span>
            <ChevronDown className="h-4 w-4 ml-2" style={{ color: 'var(--brand-primary)' }} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64 rounded-xl shadow-xl" 
          align="start"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
        >
          <DropdownMenuLabel className="font-medium px-4 py-3" style={{ color: 'var(--text-primary)' }}>
            Choose Category
          </DropdownMenuLabel>
          <DropdownMenuSeparator style={{ background: 'var(--border-light)' }} />
          
          <div className="p-2 space-y-1" role="group" aria-label="Category options">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-opacity-50"
                style={{ '&:hover': { background: 'var(--bg-section)' } }}
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
                  style={{ borderColor: 'var(--border-medium)' }}
                />
                <label 
                  htmlFor={category.id} 
                  className="text-sm cursor-pointer flex-1 flex items-center font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="mr-2" style={{ color: 'var(--brand-primary)' }} aria-hidden="true">{category.icon}</span>
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