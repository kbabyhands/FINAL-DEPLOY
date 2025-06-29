
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface MenuCardImageProps {
  imageUrl?: string;
  splatUrl?: string;
  title: string;
  onViewSplat: () => void;
}

const MenuCardImage = ({ imageUrl, splatUrl, title, onViewSplat }: MenuCardImageProps) => {
  return (
    <div className="space-y-4 order-1 lg:order-none">
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}
      
      {splatUrl && (
        <Button
          onClick={onViewSplat}
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <Eye className="w-4 h-4" />
          View 3D Dish
        </Button>
      )}
    </div>
  );
};

export default MenuCardImage;
