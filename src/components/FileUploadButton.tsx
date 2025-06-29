
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface FileUploadButtonProps {
  bucket: string;
  accept: string;
  uploading: boolean;
  uploadPhase: 'preparing' | 'uploading' | 'finalizing' | 'complete';
  isLargeFile: boolean;
  label: string;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
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

const FileUploadButton = ({
  bucket,
  accept,
  uploading,
  uploadPhase,
  isLargeFile,
  label,
  onFileSelect
}: FileUploadButtonProps) => {
  return (
    <>
      <Input
        type="file"
        accept={accept}
        onChange={onFileSelect}
        disabled={uploading}
        className="hidden"
        id={`file-upload-${bucket}`}
      />
      <Label
        htmlFor={`file-upload-${bucket}`}
        className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <Upload className="w-5 h-5" />
        <span>
          {uploading ? getUploadPhaseMessage(uploadPhase, isLargeFile) : `Click to upload ${label.toLowerCase()}`}
        </span>
      </Label>
    </>
  );
};

export default FileUploadButton;
