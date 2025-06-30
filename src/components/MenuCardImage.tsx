
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
  const [error, setError] = useState<string | null>(null);

  // Load 3D model data if model URL is provided
  useEffect(() => {
    if (modelUrl) {
      console.log('MenuCardImage: Loading 3D model from:', modelUrl);
      setLoading(true);
      setError(null);
      
      const loadModel = async () => {
        try {
          const response = await fetch(modelUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.arrayBuffer();
          
          if (data.byteLength === 0) {
            throw new Error('Empty model file');
          }
          
          console.log('MenuCardImage: Model loaded successfully, size:', data.byteLength);
          setModelData(data);
          
          // Determine file type from URL
          const lowerUrl = modelUrl.toLowerCase();
          if (lowerUrl.endsWith('.splat')) {
            setModelType('splat');
          } else {
            setModelType('ply');
          }
        } catch (error) {
          console.error('MenuCardImage: Failed to load 3D model:', error);
          setError(error instanceof Error ? error.message : 'Failed to load 3D model');
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
      if (error) {
        return (
          <div className="w-full h-64 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center rounded-lg relative">
            <div className="text-center">
              <div className="text-red-600 text-2xl mb-2">⚠️</div>
              <span className="text-red-600 text-sm font-medium">3D Model Error</span>
              <p className="text-red-500 text-xs mt-1">{error}</p>
            </div>
          </div>
        );
      }
      
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
