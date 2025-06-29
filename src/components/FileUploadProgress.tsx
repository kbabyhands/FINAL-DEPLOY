
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';

interface FileUploadProgressProps {
  uploadProgress: number;
  uploadPhase: 'preparing' | 'uploading' | 'finalizing' | 'complete';
  fileSize: string;
  uploadSpeed: string;
  isLargeFile: boolean;
  bucket: string;
}

const getUploadPhaseMessage = (uploadPhase: string, isLargeFile: boolean) => {
  switch (uploadPhase) {
    case 'preparing':
      return 'Preparing upload...';
    case 'uploading':
      return isLargeFile ? 'Uploading large file...' : 'Uploading...';
    case 'finalizing':
      return 'Finalizing upload...';
    case 'complete':
      return 'Upload complete!';
    default:
      return 'Uploading...';
  }
};

const FileUploadProgress = ({ 
  uploadProgress, 
  uploadPhase, 
  fileSize, 
  uploadSpeed, 
  isLargeFile, 
  bucket 
}: FileUploadProgressProps) => {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{getUploadPhaseMessage(uploadPhase, isLargeFile)}</span>
        <span>{Math.round(uploadProgress)}%</span>
      </div>
      <Progress value={uploadProgress} className="w-full" />
      {fileSize && (
        <div className="text-xs text-gray-500 space-y-1 text-center">
          <div>File size: {fileSize}</div>
          {uploadSpeed && <div>Speed: {uploadSpeed}</div>}
          {isLargeFile && (
            <div className="flex items-center justify-center gap-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Large file upload in progress...</span>
            </div>
          )}
          {bucket === 'gaussian-splats' && uploadPhase === 'finalizing' && (
            <div className="text-blue-600">Processing Gaussian splat file...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadProgress;
