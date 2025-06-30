
import React from "react";

interface MenuCardImageProps {
  imageUrl?: string;
  title: string;
}

const MenuCardImage = ({ imageUrl, title }: MenuCardImageProps) => {
  return (
    <div className="space-y-4 order-1 lg:order-none">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-64 object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-gray-500 text-lg font-medium">No Image Available</span>
        </div>
      )}
    </div>
  );
};

export default MenuCardImage;
