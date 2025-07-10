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
  reviewCount,
  size = 'regular'
}: MenuCardProps) => {
  // Size-specific styling
  const isFeatured = size === 'featured';
  const cardHeight = isFeatured ? 'h-[320px]' : 'h-[420px]';
  const imageHeight = isFeatured ? 'h-36' : 'h-48';
  const contentPadding = isFeatured ? 'p-4' : 'p-6';
  const titleSize = isFeatured ? 'text-base' : 'text-lg';
  const titleHeight = isFeatured ? 'h-12' : 'h-14';
  const descriptionHeight = isFeatured ? 'h-8' : 'h-10';
  const priceSize = isFeatured ? 'text-lg' : 'text-xl';
  const reviewHeight = isFeatured ? 'h-5' : 'h-6';

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
          className={`service-card cursor-pointer transition-all duration-500 overflow-hidden group ${cardHeight} flex flex-col`}
          onClick={handleOpenDialog}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${title}`}
        >
          <CardContent className="p-0 flex flex-col h-full">
            {/* Menu Item Image - Dynamic Height */}
            <div className={`relative w-full ${imageHeight} overflow-hidden flex-shrink-0`}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  style={{ borderRadius: '12px 12px 0 0' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-section)', borderRadius: '12px 12px 0 0' }}>
                  <span className="body-medium" style={{ color: 'var(--text-muted)' }}>No Image</span>
                </div>
              )}
              
              {/* 3D Model Indicator Badge */}
              {has3DModel && (
                <div className="absolute top-3 left-3">
                  <div className="text-white text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--brand-primary)' }}>
                    3D
                  </div>
                </div>
              )}
            </div>

            {/* Menu Item Content - Flexible Height */}
            <div className={`${contentPadding} flex flex-col justify-between flex-grow`}>
              <div className="flex-grow">
                {/* Title - Dynamic Height */}
                <h3 className={`font-semibold ${titleSize} mb-2 line-clamp-2 ${titleHeight} flex items-start`} style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                
                {/* Description - Dynamic Height */}
                <div className={`${descriptionHeight} mb-3`}>
                  <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {description || '\u00A0'}
                  </p>
                </div>

                {/* Review Rating Display - Dynamic Height */}
                <div className={`${reviewHeight} mb-3`}>
                  {reviewCount !== undefined && reviewCount > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {averageRating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
                <div className={`${priceSize} font-bold`} style={{ color: 'var(--text-primary)' }}>
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