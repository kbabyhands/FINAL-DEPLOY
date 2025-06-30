
import React, { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import MenuCardContent from "./MenuCardContent";
import DietaryBadges from "./DietaryBadges";
import { useMenuItemViews } from "@/hooks/useMenuItemViews";
import ThreeDModelViewer from "./ThreeDModelViewer";
import { useState } from "react";

interface MenuCardProps {
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
  modelUrl?: string;
}

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
  modelUrl
}: MenuCardProps) => {
  const { trackView } = useMenuItemViews();
  const hasTrackedView = useRef(false);
  const [modelData, setModelData] = useState<ArrayBuffer | null>(null);
  const [modelType, setModelType] = useState<'ply' | 'splat'>('ply');

  // Track view when component mounts (only once per session)
  useEffect(() => {
    if (!hasTrackedView.current) {
      const timer = setTimeout(() => {
        trackView(menuItemId);
        hasTrackedView.current = true;
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [menuItemId, trackView]);

  // Load 3D model data if model URL is provided
  useEffect(() => {
    if (modelUrl) {
      const loadModel = async () => {
        try {
          const response = await fetch(modelUrl);
          const data = await response.arrayBuffer();
          setModelData(data);
          // Determine file type from URL
          if (modelUrl.toLowerCase().endsWith('.splat')) {
            setModelType('splat');
          } else {
            setModelType('ply');
          }
        } catch (error) {
          console.error('Failed to load 3D model:', error);
        }
      };
      loadModel();
    }
  }, [modelUrl]);

  const renderPreview = () => {
    // If we have a 3D model, show it
    if (modelUrl && modelData) {
      return (
        <div className="w-full h-48 relative">
          <ThreeDModelViewer
            modelData={modelData}
            filename={title}
            type={modelType}
          />
        </div>
      );
    }
    
    // Fall back to 2D image
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      );
    }
    
    // Default placeholder
    return (
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <span className="text-blue-600 text-lg font-semibold">No Preview</span>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
          <div className="relative overflow-hidden rounded-t-lg">
            {renderPreview()}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/90 text-black font-bold">
                ${price.toFixed(2)}
              </Badge>
            </div>
            {modelUrl && (
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="bg-white/90 text-purple-600 font-bold">
                  3D
                </Badge>
              </div>
            )}
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{description}</p>
            
            <DietaryBadges
              isVegetarian={isVegetarian}
              isVegan={isVegan}
              isGlutenFree={isGlutenFree}
              isNutFree={isNutFree}
              size="sm"
            />
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <MenuCardContent
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
          modelUrl={modelUrl}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MenuCard;
