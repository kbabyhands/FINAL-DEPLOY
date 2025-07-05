import MenuCard from "@/components/MenuCard";
import { MenuItem } from "@/data/placeholderMenuItems";
import { EmptyMenuState } from "@/components/EmptyMenuState";
import { useMenuPreloader } from "@/hooks/useMenuPreloader";

interface MenuGridProps {
  filteredItems: MenuItem[];
  totalItemsCount: number;
}

export const MenuGrid = ({ filteredItems, totalItemsCount }: MenuGridProps) => {
  // Aggressively preload all 3D models for instant loading
  useMenuPreloader(filteredItems.map(item => ({
    model_url: item.model_url
  })));

  if (filteredItems.length === 0) {
    return <EmptyMenuState hasItems={totalItemsCount > 0} />;
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <MenuCard
          key={item.id}
          menuItemId={item.id}
          title={item.title}
          description={item.description || ''}
          price={item.price}
          allergens={item.allergens}
          isVegetarian={item.is_vegetarian}
          isVegan={item.is_vegan}
          isGlutenFree={item.is_gluten_free}
          isNutFree={item.is_nut_free}
          imageUrl={item.image_url}
          splatUrl={item.model_url}
        />
      ))}
    </div>
  );
};