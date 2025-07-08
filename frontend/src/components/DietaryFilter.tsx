
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
import { FILTER_CONFIG } from "@/constants";
import { pluralize } from "@/utils/formatters";
import type { DietaryFilterProps } from "@/types";

/**
 * DietaryFilter Component - Dropdown filter for dietary restrictions
 * 
 * Features:
 * - Multi-select checkbox interface
 * - Clear count indicator
 * - Keyboard navigation
 * - Accessible labels and descriptions
 */
const DietaryFilter = ({ filters, onFilterChange }: DietaryFilterProps) => {
  const filterOptions = FILTER_CONFIG.DIETARY_OPTIONS.map(option => ({
    ...option,
    checked: filters[option.key as keyof typeof filters]
  }));

  const activeFilterCount = filterOptions.filter(option => option.checked).length;

  /**
   * Handles filter toggle for dietary restrictions
   */
  const handleFilterToggle = (filterKey: string, newValue: boolean) => {
    onFilterChange(filterKey, newValue);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-amber-800 whitespace-nowrap">
        Dietary:
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white/80 border-amber-200 hover:bg-amber-50 text-amber-900 shadow-sm rounded-xl px-4 py-2 font-medium transition-all duration-200"
            aria-label="Select dietary filters"
          >
            <span className="text-sm">
              {activeFilterCount > 0 
                ? `${activeFilterCount} ${pluralize(activeFilterCount, 'filter')} applied`
                : 'All Dietary Options'
              }
            </span>
            <ChevronDown className="h-4 w-4 ml-2 text-amber-600" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-amber-200 rounded-xl shadow-xl" align="start">
          <DropdownMenuLabel className="text-amber-800 font-medium px-4 py-3">
            Dietary Preferences
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-amber-200" />
          
          <div className="p-2 space-y-1" role="group" aria-label="Dietary filter options">
            {filterOptions.map((option) => (
              <div 
                key={option.key} 
                className="flex items-center space-x-3 p-3 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors duration-150"
                onClick={() => handleFilterToggle(option.key, !option.checked)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFilterToggle(option.key, !option.checked);
                  }
                }}
              >
                <Checkbox
                  id={option.key}
                  checked={option.checked}
                  onCheckedChange={(checked) => handleFilterToggle(option.key, !!checked)}
                  aria-label={`Filter by ${option.label}`}
                  className="border-amber-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <label 
                  htmlFor={option.key} 
                  className="text-sm cursor-pointer flex-1 text-amber-900 font-medium"
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
