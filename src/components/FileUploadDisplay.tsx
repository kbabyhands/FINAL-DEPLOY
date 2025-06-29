
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Image, FileText, Zap } from 'lucide-react';

interface FileUploadDisplayProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
  currentUrl: string;
  onRemove: () => void;
}

const getFileIcon = (bucket: string) => {
  if (bucket === 'menu-images' || bucket === 'restaurant-branding') {
    return <Image className="w-4 h-4" />;
  }
  if (bucket === 'gaussian-splats') {
    return <Zap className="w-4 h-4" />;
  }
  return <FileText className="w-4 h-4" />;
};

const getFileDescription = (bucket: string) => {
  if (bucket === 'menu-images') return 'Image uploaded';
  if (bucket === 'restaurant-branding') return 'Branding asset uploaded';
  if (bucket === 'gaussian-splats') return 'Gaussian splat uploaded';
  return '3D model uploaded';
};

const FileUploadDisplay = ({ bucket, currentUrl, onRemove }: FileUploadDisplayProps) => {
  if (!currentUrl) return null;

  return (
    <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
      {getFileIcon(bucket)}
      <span className="text-sm text-gray-600 flex-1">
        {getFileDescription(bucket)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-800"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FileUploadDisplay;
