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
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      {/* Dialog Header with Navigation */}
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog and return to menu"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Menu
          </Button>
        </div>
        <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        <DialogDescription className="text-lg">
          {description}
        </DialogDescription>
      </DialogHeader>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Media Section - Image/3D Model Viewer */}
        <ViewerToggle
          splatUrl={splatUrl}
          imageUrl={imageUrl}
          title={title}
          performanceMode={performanceMode}
        />
        
        {/* Details Section */}
        <div className="space-y-6">
          {/* Price Display */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-2xl font-bold px-4 py-2">
              {formatPrice(price)}
            </Badge>
          </div>
          
          {/* Dietary Information Section */}
          <section aria-labelledby="dietary-info-title">
            <h4 id="dietary-info-title" className="font-semibold text-lg mb-3">
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
          <section aria-labelledby="allergen-info-title">
            <h4 id="allergen-info-title" className="font-semibold text-lg flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5" aria-hidden="true" />
              Allergen Information
            </h4>
            <p className="text-muted-foreground">
              <strong>Contains:</strong> {allergens?.length > 0 ? allergens.join(", ") : "None"}
            </p>
          </section>
        </div>
      </div>
      
      {/* Reviews Section */}
      <section className="mt-8" aria-labelledby="reviews-title">
        <ReviewsSection menuItemId={menuItemId} menuItemTitle={title} />
      </section>
    </DialogContent>
  );
};

export default MenuItemDialog;