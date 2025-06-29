
import React from "react";
import ThreeDModelViewer from "./ThreeDModelViewer";

interface MenuCardImageProps {
  imageUrl?: string;
  splatUrl?: string;
  title: string;
  onViewSplat: () => void;
}

const MenuCardImage = ({ imageUrl, splatUrl, title }: MenuCardImageProps) => {
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
        <div className="w-full">
          <h4 className="text-sm font-medium text-gray-700 mb-2">3D Model</h4>
          <ThreeDModelViewer
            modelUrl={splatUrl}
            title={title}
            className="rounded-lg border"
          />
        </div>
      )}
      
      {!imageUrl && !splatUrl && (
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-gray-500 text-lg font-medium">No Media Available</span>
        </div>
      )}
    </div>
  );
};

export default MenuCardImage;
