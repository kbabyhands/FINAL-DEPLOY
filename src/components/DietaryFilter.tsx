
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-wrap gap-4">
        {filterOptions.map((option) => (
          <div key={option.key} className="flex items-center space-x-2">
            <Checkbox
              id={option.key}
              checked={option.checked}
              onCheckedChange={(checked) => onFilterChange(option.key, !!checked)}
            />
            <label 
              htmlFor={option.key} 
              className="text-sm text-foreground cursor-pointer whitespace-nowrap"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietaryFilter;
