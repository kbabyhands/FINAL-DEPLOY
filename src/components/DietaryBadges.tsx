
import React from "react";
import { Leaf, Wheat, Nut } from "lucide-react";

interface DietaryBadgesProps {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
  size?: "sm" | "md";
}

const DietaryBadges = ({ 
  isVegetarian, 
  isVegan, 
  isGlutenFree, 
  isNutFree, 
  size = "sm" 
}: DietaryBadgesProps) => {
  const getDietaryBadges = () => {
    const badges = [];
    if (isVegetarian) badges.push({ icon: Leaf, label: "Vegetarian", color: "bg-green-100 text-green-800" });
    if (isVegan) badges.push({ icon: Leaf, label: "Vegan", color: "bg-green-200 text-green-900" });
    if (isGlutenFree) badges.push({ icon: Wheat, label: "Gluten Free", color: "bg-yellow-100 text-yellow-800" });
    if (isNutFree) badges.push({ icon: Nut, label: "Nut Free", color: "bg-orange-100 text-orange-800" });
    return badges;
  };

  const badges = getDietaryBadges();

  if (badges.length === 0) return null;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4"
  };

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <div 
            key={index} 
            className={`flex items-center gap-1 rounded-full ${badge.color} ${sizeClasses[size]}`}
          >
            <IconComponent className={iconSizeClasses[size]} />
            <span className="font-medium">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DietaryBadges;
