
import React from 'react';
import { useToast } from '@/hooks/use-toast';
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FileUpload
        bucket="menu-images"
        currentUrl={imageUrl}
        onUpload={onImageUpload}
        onRemove={onImageRemove}
        label="Menu Item Image"
        accept="image/*"
      />
      
      <FileUpload
        bucket="gaussian-splats"
        currentUrl={modelUrl}
        onUpload={onModelUpload}
        onRemove={onModelRemove}
        label="3D Model (PLY/ZIP)"
        accept=".ply,.zip"
      />
    </div>
  );
};

export default FileUploadsSection;
