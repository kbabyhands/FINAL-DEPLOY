
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const activeItem = categories.find(cat => cat.id === activeCategory);
  
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-foreground whitespace-nowrap">Category:</span>
      <Select value={activeCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center">
              <span className="mr-2">{activeItem?.icon}</span>
              {activeItem?.name}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoryFilter;
