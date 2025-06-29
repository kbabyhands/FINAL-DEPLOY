import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Info, AlertTriangle } from 'lucide-react';
import FileUploadButton from './FileUploadButton';
import FileUploadProgress from './FileUploadProgress';
import FileUploadDisplay from './FileUploadDisplay';
import { validateFile, formatFileSize, formatSpeed, getFileSizeInfo } from './FileUploadValidator';

interface FileUploadProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  label: string;
  accept: string;
}

const FileUpload = ({ bucket, currentUrl, onUpload, onRemove, label, accept }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<'preparing' | 'uploading' | 'finalizing' | 'complete'>('preparing');
  const { toast } = useToast();

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadSpeed('');
      setUploadPhase('preparing');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileSizeFormatted = formatFileSize(file.size);
      setFileSize(fileSizeFormatted);
      
      // Validate file
      const validation = validateFile(file, bucket);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Check if it's a large file (over 50MB threshold for progress indication)
      const isLarge = file.size > 50 * 1024 * 1024;
      setIsLargeFile(isLarge);

      if (isLarge) {
        toast({
          title: "Large File Upload",
          description: `Uploading ${fileSizeFormatted}. This may take several minutes...`,
          duration: 5000,
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      console.log('Starting upload for file:', file.name, 'Size:', fileSizeFormatted);
      
      setUploadPhase('uploading');
      const startTime = Date.now();
      
      // Enhanced upload with better error handling for Gaussian splats
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            user_id: userData.user.id,
            original_name: file.name
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Enhanced error handling for Gaussian splat files
        if (uploadError.message?.includes('Payload too large') || 
            uploadError.message?.includes('exceeded the maximum allowed size')) {
          if (bucket === 'gaussian-splats') {
            throw new Error(`File size (${fileSizeFormatted}) exceeds the server upload limit. For Gaussian splat files over 200MB, please compress your file using tools like PLY compression or reduce point density.`);
          } else {
            throw new Error(`File size (${fileSizeFormatted}) exceeds the upload limit. Please compress your file and try again.`);
          }
        }
        
        throw uploadError;
      }

      setUploadProgress(100);
      setUploadPhase('complete');
      
      const totalTime = (Date.now() - startTime) / 1000;
      const avgSpeed = file.size / totalTime;
      setUploadSpeed(formatSpeed(avgSpeed));

      console.log('Upload completed successfully');

      // Get the public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Public URL generated:', data.publicUrl);
      
      // Call the upload callback
      onUpload(data.publicUrl);

      toast({
        title: "Upload Complete",
        description: `${file.name} uploaded successfully (${fileSizeFormatted})`,
        duration: 5000,
      });

    } catch (error: any) {
      console.error('File upload error:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = error.message;
      
      if (error.message?.includes('Payload too large')) {
        if (bucket === 'gaussian-splats') {
          errorMessage = `File too large: Your Gaussian splat file (${fileSize}) exceeds the server limit. Please compress your file to under 200MB using PLY compression or reduce point density.`;
        } else {
          errorMessage = `File too large: Your file (${fileSize}) exceeds the upload limit. Please compress your file.`;
        }
      } else if (error.message?.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Please check the allowed file formats.';
      } else if (error.message?.includes('Duplicate')) {
        errorMessage = 'A file with this name already exists. Please rename your file and try again.';
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setUploading(false);
      // Reset progress after showing completion
      setTimeout(() => {
        setUploadProgress(0);
        setFileSize('');
        setUploadSpeed('');
        setIsLargeFile(false);
        setUploadPhase('preparing');
      }, 3000);
      
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const removeFile = async () => {
    if (!currentUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentUrl.split('/');
      const filePath = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      onRemove();

      toast({
        title: "File Removed",
        description: "File removed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="text-xs text-gray-500 mb-2">
        {getFileSizeInfo(bucket)}
        {bucket === 'gaussian-splats' && (
          <div className="space-y-1 mt-1">
            <div className="flex items-center gap-1 text-blue-600">
              <Info className="w-3 h-3" />
              <span>Supports .splat, .ply, and .gz formats</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Large files may need compression before upload</span>
            </div>
          </div>
        )}
      </div>
      
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
              uploading={uploading}
              uploadPhase={uploadPhase}
              isLargeFile={isLargeFile}
              label={label}
              onFileSelect={uploadFile}
            />
            
            {uploading && (
              <FileUploadProgress
                uploadProgress={uploadProgress}
                uploadPhase={uploadPhase}
                fileSize={fileSize}
                uploadSpeed={uploadSpeed}
                isLargeFile={isLargeFile}
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
