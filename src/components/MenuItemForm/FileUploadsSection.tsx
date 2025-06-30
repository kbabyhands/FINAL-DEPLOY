
import React from 'react';
import FileUpload from '@/components/FileUpload';

interface FileUploadsSectionProps {
  imageUrl: string;
  modelUrl: string;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
  onModelUpload: (url: string) => void;
  onModelRemove: () => void;
}

const FileUploadsSection = ({ 
  imageUrl, 
  modelUrl,
  onImageUpload, 
  onImageRemove,
  onModelUpload,
  onModelRemove
}: FileUploadsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <FileUpload
          bucket="menu-images"
          currentUrl={imageUrl}
          onUpload={onImageUpload}
          onRemove={onImageRemove}
          label="Menu Item Image (2D)"
          accept="image/*"
        />
      </div>
      
      <div className="w-full">
        <FileUpload
          bucket="3d-models"
          currentUrl={modelUrl}
          onUpload={onModelUpload}
          onRemove={onModelRemove}
          label="3D Model (PLY/Splat/Gaussian)"
          accept=".ply,.splat,.gz,.zip"
        />
      </div>
    </div>
  );
};

export default FileUploadsSection;
