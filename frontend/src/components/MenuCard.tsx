
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
          className="cursor-pointer transition-all duration-300 card-elevated border-0 rounded-2xl bg-white dark:bg-card overflow-hidden group h-[420px] flex flex-col" 
          onClick={handleOpenDialog}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${title}`}
        >
          <CardContent className="p-0 flex flex-col h-full">
            {/* Menu Item Image - Fixed Height */}
            <div className="relative w-full h-48 overflow-hidden flex-shrink-0">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}
              
              {/* 3D Model Indicator Badge */}
              {has3DModel && (
                <div className="absolute top-3 left-3">
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    3D
                  </div>
                </div>
              )}
            </div>

            {/* Menu Item Content - Flexible Height */}
            <div className="p-6 flex flex-col justify-between flex-grow">
              <div className="flex-grow">
                {/* Title - Fixed Height */}
                <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 h-14 flex items-start">
                  {title}
                </h3>
                
                {/* Description - Fixed Height */}
                <div className="h-10 mb-4">
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {description || '\u00A0'}
                  </p>
                </div>

                {/* Review Rating Display - Fixed Height */}
                <div className="h-6 mb-4">
                  {reviewCount !== undefined && reviewCount > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">
                        {averageRating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  ) : (
                    <div>&nbsp;</div>
                  )}
                </div>
              </div>

              {/* Price and Dietary Badges Row - Fixed at Bottom */}
              <div className="flex items-center justify-between mt-auto">
                <div className="text-xl font-bold text-foreground">
                  {formatPrice(price)}
                </div>
                
                <DietaryBadges
                  isVegetarian={isVegetarian}
                  isVegan={isVegan}
                  isGlutenFree={isGlutenFree}
                  isNutFree={isNutFree}
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
