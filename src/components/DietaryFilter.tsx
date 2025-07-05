
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
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        Dietary:
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-48 justify-between"
            aria-label="Select dietary filters"
          >
            <span>
              {activeFilterCount > 0 
                ? `${activeFilterCount} ${pluralize(activeFilterCount, 'filter')} selected`
                : 'Select dietary options'
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Dietary Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-2 space-y-2" role="group" aria-label="Dietary filter options">
            {filterOptions.map((option) => (
              <div 
                key={option.key} 
                className="flex items-center space-x-3 p-2 hover:bg-muted rounded-sm cursor-pointer"
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
