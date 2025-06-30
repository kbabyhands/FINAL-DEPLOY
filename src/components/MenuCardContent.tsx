
import React from "react";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MenuCardHeader from "./MenuCardHeader";
import MenuCardImage from "./MenuCardImage";
import MenuCardDetails from "./MenuCardDetails";
import ReviewsSection from "./ReviewsSection";

interface MenuCardContentProps {
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
}

const MenuCardContent = ({
  menuItemId,
  title,
  description,
  price,
  allergens,
  isVegetarian,
  isVegan,
  isGlutenFree,
  isNutFree,
  imageUrl
}: MenuCardContentProps) => {
  return (
    <>
      <MenuCardHeader title={title} description={description} />
      
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 mt-6">
        <MenuCardImage
          imageUrl={imageUrl}
          title={title}
        />
        
        <MenuCardDetails
          price={price}
          allergens={allergens}
          isVegetarian={isVegetarian}
          isVegan={isVegan}
          isGlutenFree={isGlutenFree}
          isNutFree={isNutFree}
        />
      </div>
      
      {/* Reviews Section */}
      <div className="mt-6 lg:mt-8">
        <ReviewsSection menuItemId={menuItemId} menuItemTitle={title} />
      </div>
      
      {/* Mobile-friendly close button at bottom */}
      <div className="mt-6 md:hidden">
        <DialogClose asChild>
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Button>
        </DialogClose>
      </div>
    </>
  );
};

export default MenuCardContent;
