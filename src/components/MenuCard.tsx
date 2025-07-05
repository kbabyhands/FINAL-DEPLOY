
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import DietaryBadges from "./DietaryBadges";
import MenuItemDialog from "./MenuItemDialog";
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

  const openDialog = () => {
    if (splatUrl?.trim() && !hasPreloaded.current) {
      preloadModel(splatUrl);
      hasPreloaded.current = true;
    }
    setIsDialogOpen(true);
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
                <DietaryBadges
                  isVegetarian={isVegetarian}
                  isVegan={isVegan}
                  isGlutenFree={isGlutenFree}
                  isNutFree={isNutFree}
                  variant="compact"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <MenuItemDialog
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
        performanceMode={performanceMode}
        onClose={() => setIsDialogOpen(false)}
      />
    </Dialog>
  );
};

export default MenuCard;
