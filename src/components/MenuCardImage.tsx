
import React from "react";

interface MenuCardImageProps {
  imageUrl?: string;
  splatUrl?: string;
  title: string;
  onViewSplat: () => void;
}

const MenuCardImage = ({ imageUrl, title }: MenuCardImageProps) => {
  return (
    <div className="space-y-4 order-1 lg:order-none">
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}
    </div>
  );
};

export default MenuCardImage;
