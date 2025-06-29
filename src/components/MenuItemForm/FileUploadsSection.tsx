
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import GaussianSplatOptimizer from '@/components/GaussianSplatOptimizer';

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
  const { toast } = useToast();

  const handleOptimizationTip = () => {
    toast({
      title: "Optimization Tips",
      description: "Consider using compressed .ply files or reducing point density for faster uploads. Tools like Gaussian Splatting WebGL optimizers can help reduce file sizes significantly.",
      duration: 8000,
    });
  };

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
      
      <div>
        <FileUpload
          bucket="gaussian-splats"
          currentUrl={modelUrl}
          onUpload={onModelUpload}
          onRemove={onModelRemove}
          label="Gaussian Splat File"
          accept=".splat,.ply,.gz"
        />
        
        {!modelUrl && (
          <GaussianSplatOptimizer onOptimizationTip={handleOptimizationTip} />
        )}
      </div>
    </div>
  );
};

export default FileUploadsSection;
