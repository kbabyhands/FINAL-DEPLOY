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
      <span className="body-medium font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
        Dietary:
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="btn-secondary font-medium transition-all duration-200"
            aria-label="Select dietary filters"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          >
            <span className="text-sm">
              {activeFilterCount > 0 
                ? `${activeFilterCount} ${pluralize(activeFilterCount, 'filter')} applied`
                : 'All Dietary Options'
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
            Dietary Preferences
          </DropdownMenuLabel>
          <DropdownMenuSeparator style={{ background: 'var(--border-light)' }} />
          
          <div className="p-2 space-y-1" role="group" aria-label="Dietary filter options">
            {filterOptions.map((option) => (
              <div 
                key={option.key} 
                className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-150"
                style={{ '&:hover': { background: 'var(--bg-section)' } }}
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
                  style={{ borderColor: 'var(--border-medium)' }}
                />
                <label 
                  htmlFor={option.key} 
                  className="text-sm cursor-pointer flex-1 font-medium"
                  style={{ color: 'var(--text-primary)' }}
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