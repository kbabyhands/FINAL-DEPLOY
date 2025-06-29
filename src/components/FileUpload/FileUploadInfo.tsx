
import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
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
      {bucket === 'gaussian-splats' && (
        <div className="space-y-1 mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center gap-1 text-blue-600 font-medium">
            <Info className="w-3 h-3" />
            <span>Gaussian Splat Upload Tips</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• Supports .splat, .ply, .gz, and .zip formats</div>
            <div>• ZIP files should contain PLY or splat data</div>
            <div>• Files over 50MB will be rejected by server</div>
            <div>• Use PLY compression tools to reduce size</div>
            <div>• Create ZIP archives for better compression</div>
            <div>• Consider reducing point cloud density</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadInfo;
