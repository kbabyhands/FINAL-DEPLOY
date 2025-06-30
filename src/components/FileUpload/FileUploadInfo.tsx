
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle } from 'lucide-react';
import { getFileSizeInfo } from '../FileUploadValidator';

interface FileUploadInfoProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
}

const FileUploadInfo = ({ bucket }: FileUploadInfoProps) => {
  const sizeInfo = getFileSizeInfo(bucket);
  
  if (bucket === '3d-models' || bucket === 'gaussian-splats') {
    return (
      <Alert className="mb-2 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <strong>Pro Plan Benefits:</strong> Upload 3D models up to 5GB! 
          Supports .ply, .ply.gz, .zip archives, and .splat files. 
          Large files will show progress indicators during upload.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="mb-2">
      <Info className="h-4 w-4" />
      <AlertDescription>
        {sizeInfo}
      </AlertDescription>
    </Alert>
  );
};

export default FileUploadInfo;
