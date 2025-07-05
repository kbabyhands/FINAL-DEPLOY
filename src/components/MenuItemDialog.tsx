import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft } from "lucide-react";
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
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
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
          <ViewerToggle
            splatUrl={splatUrl}
            imageUrl={imageUrl}
            title={title}
            performanceMode={performanceMode}
          />
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
            <DietaryBadges
              isVegetarian={isVegetarian}
              isVegan={isVegan}
              isGlutenFree={isGlutenFree}
              isNutFree={isNutFree}
              variant="detailed"
            />
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
  );
};

export default MenuItemDialog;