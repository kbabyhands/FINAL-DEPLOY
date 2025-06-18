
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
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Dietary Options</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="vegetarian"
            checked={filters.vegetarian}
            onCheckedChange={(checked) => onFilterChange('vegetarian', !!checked)}
          />
          <label htmlFor="vegetarian" className="text-sm text-gray-700 cursor-pointer">
            🌱 Vegetarian
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="vegan"
            checked={filters.vegan}
            onCheckedChange={(checked) => onFilterChange('vegan', !!checked)}
          />
          <label htmlFor="vegan" className="text-sm text-gray-700 cursor-pointer">
            🥬 Vegan
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="glutenFree"
            checked={filters.glutenFree}
            onCheckedChange={(checked) => onFilterChange('glutenFree', !!checked)}
          />
          <label htmlFor="glutenFree" className="text-sm text-gray-700 cursor-pointer">
            🌾 Gluten-Free
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="nutFree"
            checked={filters.nutFree}
            onCheckedChange={(checked) => onFilterChange('nutFree', !!checked)}
          />
          <label htmlFor="nutFree" className="text-sm text-gray-700 cursor-pointer">
            🥜 Nut-Free
          </label>
        </div>
      </div>
    </div>
  );
};

export default DietaryFilter;
