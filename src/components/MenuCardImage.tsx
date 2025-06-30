
import React, { useState, useEffect } from "react";
import ThreeDModelViewer from "./ThreeDModelViewer";
import { Badge } from "@/components/ui/badge";

interface MenuCardImageProps {
  imageUrl?: string;
  modelUrl?: string;
  title: string;
}

const MenuCardImage = ({ imageUrl, modelUrl, title }: MenuCardImageProps) => {
  const [modelData, setModelData] = useState<ArrayBuffer | null>(null);
  const [modelType, setModelType] = useState<'ply' | 'splat'>('ply');
  const [loading, setLoading] = useState(false);

  // Load 3D model data if model URL is provided
  useEffect(() => {
    if (modelUrl) {
      setLoading(true);
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
        } finally {
          setLoading(false);
        }
      };
      loadModel();
    }
  }, [modelUrl]);

  const renderContent = () => {
    // Priority 1: 3D Model
    if (modelUrl) {
      if (loading) {
        return (
          <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center rounded-lg relative">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <span className="text-purple-600 text-lg font-medium">Loading 3D Model...</span>
            </div>
          </div>
        );
      }
      
      if (modelData) {
        return (
          <div className="w-full h-64 relative rounded-lg overflow-hidden">
            <ThreeDModelViewer
              modelData={modelData}
              filename={title}
              type={modelType}
            />
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-white/90 text-purple-600 font-bold">
                3D Model
              </Badge>
            </div>
          </div>
        );
      }
    }
    
    // Priority 2: 2D Image
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-64 object-cover rounded-lg"
        />
      );
    }
    
    // Priority 3: Placeholder
    return (
      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-500 text-lg font-medium">No Preview Available</span>
      </div>
    );
  };

  return (
    <div className="space-y-4 order-1 lg:order-none">
      {renderContent()}
    </div>
  );
};

export default MenuCardImage;
