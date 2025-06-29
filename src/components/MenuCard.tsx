
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import MenuCardContent from "./MenuCardContent";
import DietaryBadges from "./DietaryBadges";
import GaussianSplatViewer from "./GaussianSplatViewer";
import { useMenuItemViews } from "@/hooks/useMenuItemViews";

interface MenuCardProps {
  menuItemId: string;
  title: string;
  description: string;
  price: number;
  allergens: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
  imageUrl?: string;
  splatUrl?: string;
}

const MenuCard = ({ 
  menuItemId,
  title, 
  description, 
  price, 
  allergens = [], 
  isVegetarian, 
  isVegan, 
  isGlutenFree, 
  isNutFree,
  imageUrl,
  splatUrl
}: MenuCardProps) => {
  const { trackView } = useMenuItemViews();
  const hasTrackedView = useRef(false);
  const [showSplatViewer, setShowSplatViewer] = useState(false);

  // Track view when component mounts (only once per session)
  useEffect(() => {
    if (!hasTrackedView.current) {
      const timer = setTimeout(() => {
        trackView(menuItemId);
        hasTrackedView.current = true;
      }, 1000); // Wait 1 second to ensure the user actually viewed the item

      return () => clearTimeout(timer);
    }
  }, [menuItemId, trackView]);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
            <div className="relative overflow-hidden rounded-t-lg">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-blue-600 text-lg font-semibold">No Image</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-black font-bold">
                  ${price.toFixed(2)}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{description}</p>
              
              <DietaryBadges
                isVegetarian={isVegetarian}
                isVegan={isVegan}
                isGlutenFree={isGlutenFree}
                isNutFree={isNutFree}
                size="sm"
              />
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <MenuCardContent
            menuItemId={menuItemId}
            title={title}
            description={description}
            price={price}
            allergens={allergens}
            isVegetarian={isVegetarian}
            isVegan={isVegan}
            isGlutenFree={isGlutenFree}
            isNutFree={isNutFree}
            imageUrl={imageUrl}
            splatUrl={splatUrl}
            onViewSplat={() => setShowSplatViewer(true)}
          />
        </DialogContent>
      </Dialog>

      {/* Gaussian Splat Viewer Modal */}
      {splatUrl && (
        <GaussianSplatViewer
          isOpen={showSplatViewer}
          onClose={() => setShowSplatViewer(false)}
          splatUrl={splatUrl}
          itemTitle={title}
        />
      )}
    </>
  );
};

export default MenuCard;
