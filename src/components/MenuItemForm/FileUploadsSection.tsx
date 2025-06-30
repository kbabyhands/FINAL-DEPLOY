
import React from 'react';
import FileUpload from '@/components/FileUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

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
  const handleModelUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onModelUpload(e.target.value);
  };

  const testModelUrl = () => {
    if (modelUrl) {
      const testUrl = `${window.location.origin}/model-viewer?model=${encodeURIComponent(modelUrl)}`;
      window.open(testUrl, '_blank');
    }
  };

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
      
      <div className="w-full space-y-4">
        <div>
          <Label htmlFor="model-url" className="text-base font-medium">
            3D Model URL (PLY/Splat/Gaussian) *
          </Label>
          <p className="text-sm text-gray-600 mb-2">
            Enter the direct URL to your .ply file (e.g., from Supabase storage)
          </p>
          <div className="flex gap-2">
            <Input
              id="model-url"
              type="url"
              value={modelUrl}
              onChange={handleModelUrlChange}
              placeholder="https://your-supabase-url.com/storage/v1/object/public/gaussian-splats/your-file.ply"
              className="flex-1"
            />
            {modelUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testModelUrl}
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Test
              </Button>
            )}
          </div>
          {modelUrl && (
            <p className="text-sm text-green-600 mt-1">
              Model URL configured: {modelUrl.length > 50 ? modelUrl.substring(0, 50) + '...' : modelUrl}
            </p>
          )}
        </div>
        
        <div>
          <FileUpload
            bucket="3d-models"
            currentUrl=""
            onUpload={onModelUpload}
            onRemove={onModelRemove}
            label="Or Upload 3D Model File"
            accept=".ply,.splat,.gz,.zip"
          />
          <p className="text-sm text-gray-500 mt-1">
            Note: Large files may take time to upload. Direct URL input is recommended for .ply files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadsSection;
