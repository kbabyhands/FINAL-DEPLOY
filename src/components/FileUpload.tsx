
import React from 'react';
import { Label } from '@/components/ui/label';
import FileUploadButton from './FileUploadButton';
import FileUploadProgress from './FileUploadProgress';
import FileUploadDisplay from './FileUploadDisplay';
import FileUploadInfo from './FileUpload/FileUploadInfo';
import { useFileUploadCore } from './FileUpload/FileUploadCore';
import { useFileUploadState } from './FileUpload/FileUploadState';
import { useFileUploadRemove } from './FileUpload/FileUploadRemove';

interface FileUploadProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  label: string;
  accept: string;
}

const FileUpload = ({ bucket, currentUrl, onUpload, onRemove, label, accept }: FileUploadProps) => {
  const { state, actions } = useFileUploadState();
  const { removeFile } = useFileUploadRemove({ bucket, currentUrl, onRemove });
  const { uploadFile } = useFileUploadCore({
    bucket,
    onUpload,
    onUploadStart: actions.handleUploadStart,
    onUploadProgress: actions.handleUploadProgress,
    onUploadComplete: actions.handleUploadComplete,
    onUploadError: actions.handleUploadError,
    onFileInfo: actions.handleFileInfo
  });

  return (
    <div>
      <Label>{label}</Label>
      <FileUploadInfo bucket={bucket} />
      
      <div className="mt-2">
        <FileUploadDisplay 
          bucket={bucket}
          currentUrl={currentUrl || ''}
          onRemove={removeFile}
        />
        
        {!currentUrl && (
          <div>
            <FileUploadButton
              bucket={bucket}
              accept={accept}
              uploading={state.uploading}
              uploadPhase={state.uploadPhase}
              isLargeFile={state.isLargeFile}
              label={label}
              onFileSelect={uploadFile}
            />
            
            {state.uploading && (
              <FileUploadProgress
                uploadProgress={state.uploadProgress}
                uploadPhase={state.uploadPhase}
                fileSize={state.fileSize}
                uploadSpeed={state.uploadSpeed}
                isLargeFile={state.isLargeFile}
                bucket={bucket}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
