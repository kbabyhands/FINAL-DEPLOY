
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
  onImageUpload, 
  onImageRemove
}: FileUploadsSectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FileUpload
        bucket="menu-images"
        currentUrl={imageUrl}
        onUpload={onImageUpload}
        onRemove={onImageRemove}
        label="Menu Item Image"
        accept="image/*"
      />
    </div>
  );
};

export default FileUploadsSection;
