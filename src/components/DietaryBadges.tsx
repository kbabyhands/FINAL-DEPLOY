import { Leaf, Wheat, Nut } from "lucide-react";

interface DietaryBadgesProps {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
  variant?: "compact" | "detailed";
}

const DietaryBadges = ({ 
  isVegetarian, 
  isVegan, 
  isGlutenFree, 
  isNutFree,
  variant = "compact"
}: DietaryBadgesProps) => {
  const getDietaryBadges = () => {
    const badges = [];
    if (isVegetarian) badges.push({ icon: Leaf, label: "Vegetarian", color: "text-green-600" });
    if (isVegan) badges.push({ icon: Leaf, label: "Vegan", color: "text-green-700" });
    if (isGlutenFree) badges.push({ icon: Wheat, label: "Gluten Free", color: "text-amber-600" });
    if (isNutFree) badges.push({ icon: Nut, label: "Nut Free", color: "text-orange-600" });
    return badges;
  };

  const badges = getDietaryBadges();

  if (badges.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-1">
        {badges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <div key={index} className={`flex items-center ${badge.color}`}>
              <IconComponent className="w-3 h-3 mr-1" />
              <span className="text-xs">{badge.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted ${badge.color}`}>
            <IconComponent className="w-4 h-4" />
            <span className="font-medium">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DietaryBadges;