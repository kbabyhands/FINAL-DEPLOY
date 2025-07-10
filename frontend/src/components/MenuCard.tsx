import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Star, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/constants";
import { detectDeviceCapabilities } from "@/utils/device";
import { formatPrice } from "@/utils/formatters";
import type { MenuCardProps } from "@/types";
import DietaryBadges from "./DietaryBadges";
import MenuItemDialog from "./MenuItemDialog";
import { useMenuItemViews } from "@/hooks/useMenuItemViews";
import { usePlayCanvasPreloader } from "@/hooks/usePlayCanvasPreloader";

/**
 * MenuCard Component - Premium design displays a menu item in card format
 * 
 * Handles:
 * - Performance optimization based on device capabilities
 * - View tracking and analytics
 * - 3D model preloading
 * - Modal dialog opening
 * - Premium visual effects
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
  const cardHeight = isFeatured ? 'h-[380px]' : 'h-[480px]';
  const imageHeight = isFeatured ? 'h-44' : 'h-56';
  const contentPadding = isFeatured ? 'p-5' : 'p-6';
  const titleSize = isFeatured ? 'text-lg' : 'text-xl';
  const titleHeight = isFeatured ? 'h-14' : 'h-16';
  const descriptionHeight = isFeatured ? 'h-10' : 'h-12';
  const priceSize = isFeatured ? 'text-xl' : 'text-2xl';
  const reviewHeight = isFeatured ? 'h-6' : 'h-7';

  // Hooks for analytics and 3D preloading
  const { trackView } = useMenuItemViews();
  const { preloadModel } = usePlayCanvasPreloader();
  
  // Refs and state for component lifecycle management
  const hasTrackedView = useRef(false);
  const hasPreloaded = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState(detectDeviceCapabilities());
  const [isHovered, setIsHovered] = useState(false);

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
          className={`premium-card cursor-pointer group ${cardHeight} flex flex-col overflow-hidden relative`}
          onClick={handleOpenDialog}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${title}`}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            boxShadow: isHovered 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 128, 255, 0.1)' 
              : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Premium Gradient Overlay */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 128, 255, 0.03) 0%, rgba(255, 255, 255, 0.05) 100%)',
              borderRadius: '20px'
            }}
          />

          <CardContent className="p-0 flex flex-col h-full relative z-10">
            {/* Premium Menu Item Image */}
            <div className={`relative w-full ${imageHeight} overflow-hidden flex-shrink-0`}>
              {imageUrl ? (
                <>
                  <img 
                    src={imageUrl} 
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                    style={{ borderRadius: '20px 20px 0 0' }}
                  />
                  {/* Image Overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%)',
                      borderRadius: '20px 20px 0 0'
                    }}
                  />
                </>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center relative"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--bg-section) 0%, rgba(243, 234, 255, 0.6) 100%)', 
                    borderRadius: '20px 20px 0 0' 
                  }}
                >
                  <span className="body-medium" style={{ color: 'var(--text-muted)' }}>No Image</span>
                </div>
              )}
              
              {/* Premium 3D Model Badge */}
              {has3DModel && (
                <div className="absolute top-4 left-4">
                  <div 
                    className="text-white text-xs font-bold px-3 py-1.5 backdrop-blur-md border border-white/20 shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)',
                      borderRadius: '100px',
                      boxShadow: '0 4px 15px rgba(0, 128, 255, 0.3)'
                    }}
                  >
                    ✨ 3D VIEW
                  </div>
                </div>
              )}

              {/* Premium Price Badge */}
              <div className="absolute top-4 right-4">
                <div 
                  className="text-white font-bold px-3 py-1.5 backdrop-blur-md border border-white/20"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '100px',
                    fontSize: '14px'
                  }}
                >
                  {formatPrice(price)}
                </div>
              </div>

              {/* Premium View Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '20px 20px 0 0' }}
              >
                <div 
                  className="flex items-center text-white font-semibold px-6 py-3 backdrop-blur-sm border border-white/20"
                  style={{ borderRadius: '100px', background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Details
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
            </div>

            {/* Premium Content Section */}
            <div className={`${contentPadding} flex flex-col justify-between flex-grow`}>
              <div className="flex-grow">
                {/* Premium Title */}
                <h3 
                  className={`font-bold ${titleSize} mb-3 line-clamp-2 ${titleHeight} flex items-start leading-tight`} 
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
                
                {/* Premium Description */}
                <div className={`${descriptionHeight} mb-4`}>
                  <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {description || 'A delicious dish crafted with care and premium ingredients.'}
                  </p>
                </div>

                {/* Premium Review Section */}
                <div className={`${reviewHeight} mb-4`}>
                  {reviewCount !== undefined && reviewCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className="w-4 h-4"
                            style={{ 
                              color: i < Math.floor(averageRating || 0) ? 'var(--brand-primary)' : 'var(--border-medium)',
                              fill: i < Math.floor(averageRating || 0) ? 'var(--brand-primary)' : 'transparent'
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {averageRating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        ({reviewCount} reviews)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className="w-4 h-4"
                          style={{ color: 'var(--border-medium)' }}
                        />
                      ))}
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>New Item</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Bottom Section */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex flex-col">
                  <span className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Starting at</span>
                  <div className={`${priceSize} font-bold`} style={{ color: 'var(--brand-primary)' }}>
                    {formatPrice(price)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DietaryBadges
                    isVegetarian={isVegetarian}
                    isVegan={isVegan}
                    isGlutenFree={isGlutenFree}
                    isNutFree={isNutFree}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Premium Shimmer Effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
              transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
              transition: 'transform 0.7s ease-in-out',
              borderRadius: '20px'
            }}
          />
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