
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface DietaryFilterProps {
  filters: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    nutFree: boolean;
  };
  onFilterChange: (filter: string, value: boolean) => void;
}

const DietaryFilter = ({ filters, onFilterChange }: DietaryFilterProps) => {
  const filterOptions = [
    { key: 'vegetarian', label: '🌱 Vegetarian', checked: filters.vegetarian },
    { key: 'vegan', label: '🥬 Vegan', checked: filters.vegan },
    { key: 'glutenFree', label: '🌾 Gluten-Free', checked: filters.glutenFree },
    { key: 'nutFree', label: '🥜 Nut-Free', checked: filters.nutFree },
  ];

  const activeFilterCount = filterOptions.filter(option => option.checked).length;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-foreground whitespace-nowrap">Dietary:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-48 justify-between">
            <span>
              {activeFilterCount > 0 
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} selected`
                : 'Select dietary options'
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Dietary Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2 space-y-2">
            {filterOptions.map((option) => (
              <div 
                key={option.key} 
                className="flex items-center space-x-3 p-2 hover:bg-muted rounded-sm cursor-pointer"
                onClick={() => onFilterChange(option.key, !option.checked)}
              >
                <Checkbox
                  id={option.key}
                  checked={option.checked}
                  onCheckedChange={(checked) => onFilterChange(option.key, !!checked)}
                />
                <label 
                  htmlFor={option.key} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DietaryFilter;
