
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import DietaryBadges from "./DietaryBadges";

interface MenuCardDetailsProps {
  price: number;
  allergens: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
}

const MenuCardDetails = ({ 
  price, 
  allergens, 
  isVegetarian, 
  isVegan, 
  isGlutenFree, 
  isNutFree 
}: MenuCardDetailsProps) => {
  const formatAllergens = (allergens: string[]) => {
    if (!allergens || allergens.length === 0) return "None";
    return allergens.map(allergen => 
      allergen.charAt(0).toUpperCase() + allergen.slice(1)
    ).join(", ");
  };

  return (
    <div className="space-y-4 lg:space-y-6 order-2 lg:order-none">
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-xl lg:text-2xl font-bold px-3 py-1 lg:px-4 lg:py-2">
          ${price.toFixed(2)}
        </Badge>
      </div>
      
      {/* Dietary Information */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Dietary Information</h4>
        <DietaryBadges
          isVegetarian={isVegetarian}
          isVegan={isVegan}
          isGlutenFree={isGlutenFree}
          isNutFree={isNutFree}
          size="md"
        />
      </div>
      
      {/* Allergen Information */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Allergen Information
        </h4>
        <p className="text-gray-700 text-sm lg:text-base">
          <strong>Contains:</strong> {formatAllergens(allergens)}
        </p>
      </div>
    </div>
  );
};

export default MenuCardDetails;
