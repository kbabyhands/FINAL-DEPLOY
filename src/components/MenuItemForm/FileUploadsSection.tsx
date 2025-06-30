
import React from 'react';
import FileUpload from '@/components/FileUpload';

interface FileUploadsSectionProps {
  imageUrl: string;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
}

const FileUploadsSection = ({ 
  imageUrl, 
  onImageUpload, 
  onImageRemove
}: FileUploadsSectionProps) => {
  return (
    <div className="w-full">
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
