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
 * MenuItemDialog Component - Detailed view of a menu item in modal format
 * 
 * Features:
 * - Comprehensive item information display
 * - 3D model and image viewing
 * - Dietary information section
 * - Allergen information display
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
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm border-amber-200 rounded-2xl">
      {/* Dialog Header with Navigation */}
      <DialogHeader className="relative">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-xl transition-all duration-200"
            aria-label="Close dialog and return to menu"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Menu
          </Button>
        </div>
        <DialogTitle className="text-3xl font-serif font-light text-amber-900 mb-3">
          {title}
        </DialogTitle>
        <DialogDescription className="text-lg text-amber-800 leading-relaxed">
          {description}
        </DialogDescription>
      </DialogHeader>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Media Section - Image/3D Model Viewer */}
        <div className="bg-white/60 dark:bg-amber-950/40 rounded-2xl p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
          <ViewerToggle
            splatUrl={splatUrl}
            imageUrl={imageUrl}
            title={title}
            performanceMode={performanceMode}
          />
        </div>
        
        {/* Details Section */}
        <div className="space-y-6">
          {/* Price Display */}
          <div className="bg-white/60 dark:bg-amber-950/40 rounded-2xl p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/30 px-6 py-3 rounded-xl shadow-sm">
                {formatPrice(price)}
              </div>
            </div>
          </div>
          
          {/* Dietary Information Section */}
          <section aria-labelledby="dietary-info-title" className="bg-white/60 dark:bg-amber-950/40 rounded-2xl p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
            <h4 id="dietary-info-title" className="font-semibold text-xl text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full"></div>
              Dietary Information
            </h4>
            <DietaryBadges
              isVegetarian={isVegetarian}
              isVegan={isVegan}
              isGlutenFree={isGlutenFree}
              isNutFree={isNutFree}
              variant="detailed"
            />
          </section>
          
          {/* Allergen Information Section */}
          <section aria-labelledby="allergen-info-title" className="bg-white/60 dark:bg-amber-950/40 rounded-2xl p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
            <h4 id="allergen-info-title" className="font-semibold text-xl text-amber-900 dark:text-amber-100 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              Allergen Information
            </h4>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                <span className="text-amber-900 dark:text-amber-100 font-semibold">Contains:</span>{' '}
                {allergens?.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-2">
                    {allergens.map((allergen, index) => (
                      <span key={index} className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-1 rounded-lg text-sm font-medium">
                        {allergen}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-green-700 dark:text-green-400 font-semibold">None</span>
                )}
              </p>
            </div>
          </section>
        </div>
      </div>
      
      {/* Reviews Section */}
      <section className="mt-8 bg-white/60 dark:bg-amber-950/40 rounded-2xl p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50" aria-labelledby="reviews-title">
        <ReviewsSection menuItemId={menuItemId} menuItemTitle={title} />
      </section>
    </DialogContent>
  );
};

export default MenuItemDialog;