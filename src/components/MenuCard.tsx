import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Leaf, Wheat, Shield, Nut, Eye, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewsSection from "./ReviewsSection";
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

  const getDietaryBadges = () => {
    const badges = [];
    if (isVegetarian) badges.push({ icon: Leaf, label: "Vegetarian", color: "bg-green-100 text-green-800" });
    if (isVegan) badges.push({ icon: Leaf, label: "Vegan", color: "bg-green-200 text-green-900" });
    if (isGlutenFree) badges.push({ icon: Wheat, label: "Gluten Free", color: "bg-yellow-100 text-yellow-800" });
    if (isNutFree) badges.push({ icon: Nut, label: "Nut Free", color: "bg-orange-100 text-orange-800" });
    return badges;
  };

  const formatAllergens = (allergens: string[]) => {
    if (!allergens || allergens.length === 0) return "None";
    return allergens.map(allergen => 
      allergen.charAt(0).toUpperCase() + allergen.slice(1)
    ).join(", ");
  };

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
              
              {/* Dietary badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {getDietaryBadges().map((badge, index) => {
                  const IconComponent = badge.icon;
                  return (
                    <div key={index} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${badge.color}`}>
                      <IconComponent className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            {/* Mobile-friendly close button in header */}
            <div className="flex items-center justify-between mb-2">
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 md:hidden"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Menu
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute -top-2 -right-2 md:hidden h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
            
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            <DialogDescription className="text-lg">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 mt-6">
            {/* Image/Splat Section */}
            <div className="space-y-4 order-1 lg:order-none">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              {splatUrl && (
                <Button
                  onClick={() => setShowSplatViewer(true)}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Eye className="w-4 h-4" />
                  View 3D Dish
                </Button>
              )}
            </div>
            
            {/* Details Section */}
            <div className="space-y-4 lg:space-y-6 order-2 lg:order-none">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xl lg:text-2xl font-bold px-3 py-1 lg:px-4 lg:py-2">
                  ${price.toFixed(2)}
                </Badge>
              </div>
              
              {/* Dietary Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Dietary Information</h4>
                <div className="flex flex-wrap gap-2">
                  {getDietaryBadges().map((badge, index) => {
                    const IconComponent = badge.icon;
                    return (
                      <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${badge.color}`}>
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium">{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
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
          </div>
          
          {/* Reviews Section */}
          <div className="mt-6 lg:mt-8">
            <ReviewsSection menuItemId={menuItemId} menuItemTitle={title} />
          </div>
          
          {/* Mobile-friendly close button at bottom */}
          <div className="mt-6 md:hidden">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Menu
              </Button>
            </DialogClose>
          </div>
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
