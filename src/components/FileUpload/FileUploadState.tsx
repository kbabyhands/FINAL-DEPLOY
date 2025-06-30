
import { useState } from 'react';

export interface FileUploadState {
  uploading: boolean;
  uploadProgress: number;
  fileSize: string;
  uploadSpeed: string;
  isLargeFile: boolean;
  uploadPhase: 'preparing' | 'uploading' | 'finalizing' | 'complete';
}

export const useFileUploadState = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<'preparing' | 'uploading' | 'finalizing' | 'complete'>('preparing');

  const resetState = () => {
    setTimeout(() => {
      setUploadProgress(0);
      setFileSize('');
      setUploadSpeed('');
      setIsLargeFile(false);
      setUploadPhase('preparing');
    }, 3000);
  };

  const handleUploadStart = () => {
    setUploading(true);
    setUploadProgress(0);
    setUploadSpeed('');
    setUploadPhase('preparing');
  };

  const handleUploadProgress = (progress: number, phase: 'preparing' | 'uploading' | 'finalizing' | 'complete') => {
    setUploadProgress(progress);
    setUploadPhase(phase);
  };

  const handleUploadComplete = () => {
    setUploading(false);
    resetState();
  };

  const handleUploadError = () => {
    setUploading(false);
    resetState();
  };

  const handleFileInfo = (size: string, speed: string, isLarge: boolean) => {
    setFileSize(size);
    setUploadSpeed(speed);
    setIsLargeFile(isLarge);
  };

  return {
    state: {
      uploading,
      uploadProgress,
      fileSize,
      uploadSpeed,
      isLargeFile,
      uploadPhase
    },
    actions: {
      handleUploadStart,
      handleUploadProgress,
      handleUploadComplete,
      handleUploadError,
      handleFileInfo
    }
  };
};
