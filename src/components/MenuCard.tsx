
import React, { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import MenuCardContent from "./MenuCardContent";
import DietaryBadges from "./DietaryBadges";
import { useMenuItemViews } from "@/hooks/useMenuItemViews";
import ThreeDModelViewer from "./ThreeDModelViewer";
import { useState } from "react";
import { FileProcessor } from "@/utils/fileProcessor";

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
  const [modelError, setModelError] = useState<string | null>(null);

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
      console.log('MenuCard: Loading 3D model from:', modelUrl);
      const loadModel = async () => {
        try {
          const response = await fetch(modelUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          
          if (arrayBuffer.byteLength === 0) {
            throw new Error('Empty file');
          }
          
          console.log('MenuCard: Raw file loaded, size:', arrayBuffer.byteLength);
          
          // Create a File object from the ArrayBuffer to use with FileProcessor
          const filename = modelUrl.split('/').pop() || 'model.ply';
          const file = new File([arrayBuffer], filename);
          
          console.log('MenuCard: Processing file with FileProcessor...');
          const processedFile = await FileProcessor.processFile(file);
          
          console.log('MenuCard: File processed successfully, type:', processedFile.type, 'size:', processedFile.data.byteLength);
          setModelData(processedFile.data);
          setModelType(processedFile.type);
          setModelError(null);
        } catch (error) {
          console.error('MenuCard: Failed to load/process 3D model:', error);
          setModelError(error instanceof Error ? error.message : 'Load failed');
        }
      };
      loadModel();
    }
  }, [modelUrl]);

  const renderPreview = () => {
    // If we have a 3D model, show it
    if (modelUrl) {
      if (modelError) {
        return (
          <div className="w-full h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
            <div className="text-center">
              <span className="text-red-600 text-sm font-semibold">3D Model Error</span>
              <p className="text-red-500 text-xs">{modelError}</p>
            </div>
          </div>
        );
      }
      
      if (modelData) {
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
      
      // Loading state
      return (
        <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <span className="text-purple-600 text-sm font-semibold">Loading 3D...</span>
          </div>
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
