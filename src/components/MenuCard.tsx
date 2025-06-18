
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface MenuCardProps {
  title: string;
  description: string;
  price: number;
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
}

const MenuCard = ({ 
  title, 
  description, 
  price, 
  allergens = [],
  isVegetarian = false,
  isVegan = false,
  isGlutenFree = false,
  isNutFree = false
}: MenuCardProps) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-0">
        {/* 3D Model Placeholder */}
        <div className="bg-gray-100 h-48 flex flex-col items-center justify-center text-gray-400">
          <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-2">
            <div className="w-8 h-8 border border-gray-300 rounded"></div>
          </div>
          <span className="text-sm">Interactive 3D Model</span>
          <span className="text-xs">(Placeholder)</span>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{description}</p>
          
          {/* Dietary badges and allergen warnings */}
          <div className="flex flex-wrap gap-2 mb-4">
            {isVegetarian && <Badge variant="outline" className="text-green-600 border-green-600">🌱</Badge>}
            {isVegan && <Badge variant="outline" className="text-green-600 border-green-600">🥬</Badge>}
            {isGlutenFree && <Badge variant="outline" className="text-blue-600 border-blue-600">🌾</Badge>}
            {isNutFree && <Badge variant="outline" className="text-orange-600 border-orange-600">🥜</Badge>}
          </div>
          
          {allergens.length > 0 && (
            <div className="flex items-start gap-1 mb-4 text-red-500 text-xs">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Contains: {allergens.join(", ")}</span>
            </div>
          )}
          
          {/* Price and actions */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-gray-800">${price.toFixed(2)}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                AR
              </Button>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
