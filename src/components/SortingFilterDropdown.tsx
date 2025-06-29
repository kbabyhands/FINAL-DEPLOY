
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface DietaryFilters {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  nutFree: boolean;
}

interface SortingFilterDropdownProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  dietaryFilters: DietaryFilters;
  onFilterChange: (filter: string, value: boolean) => void;
}

const SortingFilterDropdown = ({
  categories,
  activeCategory,
  onCategoryChange,
  dietaryFilters,
  onFilterChange
}: SortingFilterDropdownProps) => {
  const activeFiltersCount = Object.values(dietaryFilters).filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Category Dropdown */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <Select value={activeCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dietary Options Dropdown */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dietary Options
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Dietary Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white z-50">
            <DropdownMenuLabel>Dietary Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuCheckboxItem
              checked={dietaryFilters.vegetarian}
              onCheckedChange={(checked) => onFilterChange('vegetarian', !!checked)}
            >
              🌱 Vegetarian
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuCheckboxItem
              checked={dietaryFilters.vegan}
              onCheckedChange={(checked) => onFilterChange('vegan', !!checked)}
            >
              🥬 Vegan
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuCheckboxItem
              checked={dietaryFilters.glutenFree}
              onCheckedChange={(checked) => onFilterChange('glutenFree', !!checked)}
            >
              🌾 Gluten-Free
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuCheckboxItem
              checked={dietaryFilters.nutFree}
              onCheckedChange={(checked) => onFilterChange('nutFree', !!checked)}
            >
              🥜 Nut-Free
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SortingFilterDropdown;
