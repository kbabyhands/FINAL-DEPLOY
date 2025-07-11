import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/utils/formatters";
import DietaryBadges from "./DietaryBadges";
import ViewerToggle from "./ViewerToggle";
import ReviewsSection from "./ReviewsSection";

interface MenuItemDialogProps {
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
  performanceMode: boolean;
  onClose: () => void;
}

/**
 * MenuItemDialog Component - Premium detailed view of a menu item in modal format
 * 
 * Features:
 * - Large 3D model viewer as main focus
 * - ScaleFast design system
 * - Comprehensive item information display
 * - Reviews and rating system
 * - Accessible navigation
 */
const MenuItemDialog = ({
  menuItemId,
  title,
  description,
  price,
  allergens,
  isVegetarian,
  isVegan,
  isGlutenFree,
  isNutFree,
  imageUrl,
  splatUrl,
  performanceMode,
  onClose
}: MenuItemDialogProps) => {
  return (
    <DialogContent 
      className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 border-0"
      style={{ 
        background: 'var(--bg-page)',
        borderRadius: '20px'
      }}
    >
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 px-6 py-4" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', borderRadius: '20px 20px 0 0' }}>
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </button>
      </div>

      {/* Main Content Grid - 3D Viewer Takes Center Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-3">
        
        {/* Left Column - Large 3D Viewer (Takes 3/4 of space) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Title Section */}
          <div className="mb-3">
            <h1 className="heading-2 mb-2" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          </div>

          {/* Large 3D Viewer - Main Focus */}
          <div 
            className="service-card p-3 overflow-hidden"
            style={{ height: '400px', borderRadius: '20px' }}
          >
            <ViewerToggle
              splatUrl={splatUrl}
              imageUrl={imageUrl}
              title={title}
              performanceMode={performanceMode}
              height="100%"
              width="100%"
            />
          </div>

          {/* Reviews Section - Remove duplicate heading */}
          <div className="service-card py-3 px-4">
            <ReviewsSection menuItemId={menuItemId} menuItemTitle={title} />
          </div>
        </div>

        {/* Right Column - Compact Details (Takes 1/4 of space) */}
        <div className="space-y-4">
          
          {/* Price Display */}
          <div className="service-card text-center py-4 px-3">
            <div 
              className="text-2xl font-bold mb-1 px-3 py-2 rounded-xl"
              style={{ 
                color: 'var(--brand-primary)',
                background: 'var(--bg-section)'
              }}
            >
              {formatPrice(price)}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Premium Quality
            </p>
          </div>

          {/* Dietary Information */}
          <div className="service-card py-4 px-3">
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>
              🌿 Dietary Info
            </h4>
            <DietaryBadges
              isVegetarian={isVegetarian}
              isVegan={isVegan}
              isGlutenFree={isGlutenFree}
              isNutFree={isNutFree}
            />
          </div>
          
          {/* Allergen Information */}
          <div className="service-card py-4 px-3">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--brand-primary)' }}>
              <Shield className="w-4 h-4" />
              Allergens
            </h4>
            <div 
              className="p-3 rounded-xl border"
              style={{ 
                background: 'var(--bg-section)',
                borderColor: 'var(--border-light)'
              }}
            >
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                <span className="font-semibold">Contains:</span>{' '}
                {allergens?.length > 0 ? (
                  <span className="text-red-600">
                    {allergens.join(', ')}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>None</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button className="btn-primary w-full text-sm py-2">
              Add to Order
            </button>
            <button className="btn-secondary w-full text-sm py-2">
              Share Item
            </button>
          </div>

          {/* Quick Details */}
          <div className="service-card py-4 px-3">
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Details
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Category</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Food</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Prep Time</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>5-8 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Calories</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>~300</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default MenuItemDialog;