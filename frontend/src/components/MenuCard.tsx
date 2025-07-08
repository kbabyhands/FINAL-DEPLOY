
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Star } from "lucide-react";
import { APP_CONFIG } from "@/constants";
import { detectDeviceCapabilities } from "@/utils/device";
import { formatPrice } from "@/utils/formatters";
import type { MenuCardProps } from "@/types";
import DietaryBadges from "./DietaryBadges";
import MenuItemDialog from "./MenuItemDialog";
import { useMenuItemViews } from "@/hooks/useMenuItemViews";
import { usePlayCanvasPreloader } from "@/hooks/usePlayCanvasPreloader";

/**
 * MenuCard Component - Displays a menu item in card format
 * 
 * Handles:
 * - Performance optimization based on device capabilities
 * - View tracking and analytics
 * - 3D model preloading
 * - Modal dialog opening
 */
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
  splatUrl,
  averageRating,
  reviewCount
}: MenuCardProps) => {
  // Hooks for analytics and 3D preloading
  const { trackView } = useMenuItemViews();
  const { preloadModel } = usePlayCanvasPreloader();
  
  // Refs and state for component lifecycle management
  const hasTrackedView = useRef(false);
  const hasPreloaded = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState(detectDeviceCapabilities());

  // Update device capabilities on mount
  useEffect(() => {
    setDeviceCapabilities(detectDeviceCapabilities());
  }, []);

  // Track view when component becomes visible (analytics)
  useEffect(() => {
    if (!hasTrackedView.current) {
      const timer = setTimeout(() => {
        trackView(menuItemId);
        hasTrackedView.current = true;
      }, APP_CONFIG.DELAYS.VIEW_TRACKING_MS);

      return () => clearTimeout(timer);
    }
  }, [menuItemId, trackView]);

  // Preload 3D model when card comes into viewport
  useEffect(() => {
    if (!hasPreloaded.current && splatUrl?.trim() && cardRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasPreloaded.current) {
              setTimeout(() => {
                preloadModel(splatUrl);
                hasPreloaded.current = true;
              }, APP_CONFIG.DELAYS.MODEL_PRELOAD_MS);
            }
          });
        },
        { 
          threshold: APP_CONFIG.INTERSECTION_OBSERVER.THRESHOLD, 
          rootMargin: APP_CONFIG.INTERSECTION_OBSERVER.ROOT_MARGIN 
        }
      );

      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, [splatUrl, preloadModel]);

  /**
   * Handles opening the menu item dialog
   * Ensures 3D model is preloaded before opening
   */
  const handleOpenDialog = () => {
    if (splatUrl?.trim() && !hasPreloaded.current) {
      preloadModel(splatUrl);
      hasPreloaded.current = true;
    }
    setIsDialogOpen(true);
  };

  /**
   * Handles closing the menu item dialog
   */
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const has3DModel = Boolean(splatUrl?.trim());

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card 
          ref={cardRef} 
          className="cursor-pointer transition-all duration-300 card-elevated border-0 rounded-2xl bg-white dark:bg-card overflow-hidden group" 
          onClick={handleOpenDialog}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${title}`}
        >
          <CardContent className="p-5">
            <div className="flex space-x-4">
              {/* Menu Item Image */}
              <div className="w-20 h-20 flex-shrink-0 relative">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={title}
                    className="w-full h-full object-cover rounded-xl shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center shadow-inner">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>
                )}
                
                {/* 3D Model Indicator */}
                {has3DModel && (
                  <div className="absolute -top-1 -right-1" title="3D model available">
                    <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-md">
                      <Eye className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Item Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-1">
                    {title}
                  </h3>
                  <Badge variant="secondary" className="ml-2 font-semibold shadow-sm px-3 py-1">
                    {formatPrice(price)}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                  {description}
                </p>

                {/* Review Rating Display */}
                {reviewCount !== undefined && reviewCount > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">
                      {averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}

                {/* Dietary Information Badges */}
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
      
      {/* Menu Item Detail Dialog */}
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
        performanceMode={deviceCapabilities.performanceMode}
        onClose={handleCloseDialog}
      />
    </Dialog>
  );
};

export default MenuCard;
