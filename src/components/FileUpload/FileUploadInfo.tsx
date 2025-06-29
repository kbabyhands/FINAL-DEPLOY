
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getFileSizeInfo } from '../FileUploadValidator';

interface FileUploadInfoProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
}

const FileUploadInfo = ({ bucket }: FileUploadInfoProps) => {
  return (
    <div className="text-xs text-gray-500 mb-2">
      <div className="flex items-center gap-1 text-amber-600 mb-1">
        <AlertTriangle className="w-3 h-3" />
        <span>Server upload limit: 50MB (Supabase limitation)</span>
      </div>
      {getFileSizeInfo(bucket)}
    </div>
  );
};

export default FileUploadInfo;
