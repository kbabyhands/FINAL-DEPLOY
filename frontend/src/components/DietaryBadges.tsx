import { Leaf, Wheat, Nut } from "lucide-react";
import type { DietaryBadgesProps } from "@/types";

/**
 * DietaryBadges Component - Displays dietary restriction badges
 * 
 * Features:
 * - Compact variant for cards
 * - Detailed variant for dialogs
 * - Consistent iconography and styling
 */
const DietaryBadges = ({ 
  isVegetarian, 
  isVegan, 
  isGlutenFree, 
  isNutFree,
  variant = "compact"
}: DietaryBadgesProps) => {
  /**
   * Generates badge configuration based on dietary restrictions
   */
  const getDietaryBadges = () => {
    const badges = [];
    if (isVegetarian) badges.push({ icon: Leaf, label: "Vegetarian", color: "text-green-600" });
    if (isVegan) badges.push({ icon: Leaf, label: "Vegan", color: "text-green-700" });
    if (isGlutenFree) badges.push({ icon: Wheat, label: "Gluten Free", color: "text-amber-600" });
    if (isNutFree) badges.push({ icon: Nut, label: "Nut Free", color: "text-orange-600" });
    return badges;
  };

  const badges = getDietaryBadges();

  // Don't render anything if no dietary restrictions
  if (badges.length === 0) return null;

  // Compact variant for menu cards
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-1" role="list" aria-label="Dietary information">
        {badges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <div 
              key={index} 
              className={`flex items-center ${badge.color}`}
              role="listitem"
              title={badge.label}
            >
              <IconComponent className="w-3 h-3 mr-1" aria-hidden="true" />
              <span className="text-xs">{badge.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Detailed variant for dialogs
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Dietary information">
      {badges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <div 
            key={index} 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted ${badge.color}`}
            role="listitem"
          >
            <IconComponent className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DietaryBadges;