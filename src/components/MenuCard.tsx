
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Leaf, Wheat, Shield, Nut, Eye, ArrowLeft } from "lucide-react";
import ReviewsSection from "./ReviewsSection";
import PlayCanvasViewer from "./PlayCanvasViewer";
import { useMenuItemViews } from "@/hooks/useMenuItemViews";
import { usePlayCanvasPreloader } from "@/hooks/usePlayCanvasPreloader";

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
  const { preloadModel } = usePlayCanvasPreloader();
  const hasTrackedView = useRef(false);
  const hasPreloaded = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  // Detect performance mode based on device capabilities
  useEffect(() => {
    const detectPerformanceMode = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      const hasSlowConnection = (navigator as any).connection && 
        ((navigator as any).connection.effectiveType === 'slow-2g' || (navigator as any).connection.effectiveType === '2g');
      
      setPerformanceMode(isMobile || hasLowMemory || hasSlowConnection);
    };

    detectPerformanceMode();
  }, []);

  // Track view when component mounts (only once per session)
  useEffect(() => {
    if (!hasTrackedView.current) {
      const timer = setTimeout(() => {
        trackView(menuItemId);
        hasTrackedView.current = true;
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [menuItemId, trackView]);

  // Preload 3D model when card comes into view
  useEffect(() => {
    if (!hasPreloaded.current && splatUrl?.trim() && cardRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasPreloaded.current) {
              setTimeout(() => {
                preloadModel(splatUrl);
                hasPreloaded.current = true;
              }, 500);
            }
          });
        },
        { threshold: 0.2, rootMargin: '50px' }
      );

      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, [splatUrl, preloadModel]);

  const getDietaryBadges = () => {
    const badges = [];
    if (isVegetarian) badges.push({ icon: Leaf, label: "Vegetarian", color: "text-green-600" });
    if (isVegan) badges.push({ icon: Leaf, label: "Vegan", color: "text-green-700" });
    if (isGlutenFree) badges.push({ icon: Wheat, label: "Gluten Free", color: "text-amber-600" });
    if (isNutFree) badges.push({ icon: Nut, label: "Nut Free", color: "text-orange-600" });
    return badges;
  };

  const openDialog = () => {
    if (splatUrl?.trim() && !hasPreloaded.current) {
      preloadModel(splatUrl);
      hasPreloaded.current = true;
    }
    setIs3DMode(Boolean(splatUrl?.trim()));
    setIsDialogOpen(true);
  };

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card 
          ref={cardRef} 
          className="cursor-pointer transition-all duration-200 hover:shadow-lg border border-border rounded-lg shadow-sm hover:bg-muted/50 bg-card" 
          onClick={openDialog}
        >
          <CardContent className="p-4">
            <div className="flex space-x-4">
              {/* Image */}
              <div className="w-20 h-20 flex-shrink-0 relative">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={title}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>
                )}
                {splatUrl && splatUrl.trim() && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Eye className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-1">
                    {title}
                  </h3>
                  <Badge variant="secondary" className="ml-2 font-semibold">
                    ${price.toFixed(2)}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                  {description}
                </p>

                {/* Dietary badges */}
                <div className="flex flex-wrap gap-1">
                  {getDietaryBadges().map((badge, index) => {
                    const IconComponent = badge.icon;
                    return (
                      <div key={index} className={`flex items-center ${badge.color}`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        <span className="text-xs">{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </Button>
          </div>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-lg">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Image/3D Model Section */}
          <div className="space-y-4">
            {is3DMode && splatUrl && splatUrl.trim() ? (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <PlayCanvasViewer
                  splatUrl={splatUrl}
                  className="h-full"
                  performanceMode={performanceMode}
                  lazyLoad={false}
                />
              </div>
            ) : imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-64 object-cover rounded-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-lg">
                <span className="text-muted-foreground text-lg font-medium">No Preview Available</span>
              </div>
            )}
            {splatUrl && splatUrl.trim() && (
              <Button
                onClick={toggle3DMode}
                variant="outline"
                className="w-full"
              >
                {is3DMode ? (
                  <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Image
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {performanceMode ? 'View in 3D (Performance Mode)' : 'View in 3D'}
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-2xl font-bold px-4 py-2">
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
                    <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted ${badge.color}`}>
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
              <p className="text-muted-foreground">
                <strong>Contains:</strong> {allergens?.length > 0 ? allergens.join(", ") : "None"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-8">
          <ReviewsSection menuItemId={menuItemId} menuItemTitle={title} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuCard;
