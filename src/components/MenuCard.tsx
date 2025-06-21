
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Star, MessageSquare } from "lucide-react";
import ModelViewer from "./ModelViewer";
import ReviewsSection from "./ReviewsSection";

interface MenuCardProps {
  title: string;
  description: string;
  price: number;
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
  imageUrl?: string;
  modelUrl?: string;
  menuItemId?: string;
}

const MenuCard = ({ 
  title, 
  description, 
  price, 
  allergens = [],
  isVegetarian = false,
  isVegan = false,
  isGlutenFree = false,
  isNutFree = false,
  imageUrl,
  modelUrl,
  menuItemId
}: MenuCardProps) => {
  const [isModelViewerOpen, setIsModelViewerOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const handleARView = () => {
    if (modelUrl) {
      setIsModelViewerOpen(true);
    }
  };

  return (
    <>
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          {/* Image or 3D Model Display */}
          <div className="bg-gray-100 h-48 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-2">
                      <div class="w-8 h-8 border border-gray-300 rounded"></div>
                    </div>
                    <span class="text-sm">Image unavailable</span>
                  `;
                }}
              />
            ) : modelUrl ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-2 border-blue-300 rounded-lg flex items-center justify-center mb-2 bg-blue-50">
                  <div className="w-8 h-8 border border-blue-400 rounded bg-blue-100"></div>
                </div>
                <span className="text-sm text-blue-600 font-medium">3D Model Available</span>
                <span className="text-xs text-gray-500">Click AR to view</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-2">
                  <div className="w-8 h-8 border border-gray-300 rounded"></div>
                </div>
                <span className="text-sm">No media available</span>
              </div>
            )}
            
            {/* 3D Model Indicator */}
            {modelUrl && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  3D
                </Badge>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-3">{description}</p>
            
            {/* Dietary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {isVegetarian && <Badge variant="outline" className="text-green-600 border-green-600">🌱 Vegetarian</Badge>}
              {isVegan && <Badge variant="outline" className="text-green-600 border-green-600">🥬 Vegan</Badge>}
              {isGlutenFree && <Badge variant="outline" className="text-blue-600 border-blue-600">🌾 Gluten-Free</Badge>}
              {isNutFree && <Badge variant="outline" className="text-orange-600 border-orange-600">🥜 Nut-Free</Badge>}
            </div>
            
            {/* Allergen warnings */}
            {allergens.length > 0 && (
              <div className="flex items-start gap-1 mb-4 text-red-500 text-xs">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Contains: {allergens.join(", ")}</span>
              </div>
            )}
            
            {/* Price and actions */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-semibold text-gray-800">${price.toFixed(2)}</span>
              <div className="flex gap-2">
                {modelUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleARView}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    3D View
                  </Button>
                )}
                <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                  Order Now
                </Button>
              </div>
            </div>

            {/* Reviews Toggle */}
            {menuItemId && (
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviews(!showReviews)}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showReviews ? "Hide Reviews" : "Show Reviews & Ratings"}
                </Button>
                
                {/* Reviews Section */}
                {showReviews && menuItemId && (
                  <div className="mt-4 pt-4 border-t">
                    <ReviewsSection 
                      menuItemId={menuItemId} 
                      menuItemTitle={title}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3D Model Viewer Modal */}
      {modelUrl && (
        <ModelViewer
          isOpen={isModelViewerOpen}
          onClose={() => setIsModelViewerOpen(false)}
          modelUrl={modelUrl}
          itemTitle={title}
        />
      )}
    </>
  );
};

export default MenuCard;
