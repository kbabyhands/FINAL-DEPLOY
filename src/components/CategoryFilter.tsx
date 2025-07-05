
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

interface CategoryFilterProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  // Convert single selection to multi-selection logic
  const selectedCategories = activeCategory === 'all' ? [] : [activeCategory];
  
  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      onCategoryChange('all');
    } else {
      onCategoryChange(categoryId);
    }
  };

  const activeCategoryNames = selectedCategories.length > 0 
    ? categories.filter(cat => selectedCategories.includes(cat.id)).map(cat => cat.name)
    : ['All'];

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-foreground whitespace-nowrap">Category:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-48 justify-between">
            <span>
              {activeCategoryNames.length > 0 
                ? activeCategoryNames.join(', ')
                : 'Select categories'
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2 space-y-2">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center space-x-3 p-2 hover:bg-muted rounded-sm cursor-pointer"
                onClick={() => handleCategoryToggle(category.id)}
              >
                <Checkbox
                  id={category.id}
                  checked={activeCategory === category.id}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <label 
                  htmlFor={category.id} 
                  className="text-sm cursor-pointer flex-1 flex items-center"
                >
                  <span className="mr-2">{category.icon}</span>
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
