
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image, Zap, AlertTriangle, Info } from 'lucide-react';

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

  // File size limits (in bytes) - adjusted for Supabase limits
  const FILE_SIZE_LIMITS = {
    'menu-images': 10 * 1024 * 1024, // 10MB
    'restaurant-branding': 10 * 1024 * 1024, // 10MB
    '3d-models': 50 * 1024 * 1024, // 50MB
    'gaussian-splats': 100 * 1024 * 1024, // Reduced to 100MB due to Supabase limits
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const validateFile = (file: File): { valid: boolean; message?: string } => {
    const maxSize = FILE_SIZE_LIMITS[bucket];
    
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${formatFileSize(maxSize)} for ${bucket}. Please compress your file or use a smaller version.`
      };
    }

    // Check for Gaussian splat specific formats
    if (bucket === 'gaussian-splats') {
      const validExtensions = ['.splat', '.ply', '.gz'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        return {
          valid: false,
          message: 'Please upload a valid Gaussian splat file (.splat, .ply, or .gz format).'
        };
      }
    }

    return { valid: true };
  };

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
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Check if it's a large file
      const isLarge = file.size > 50 * 1024 * 1024; // 50MB threshold
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
      
      // Try direct upload
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
        
        // Check for size-related errors in the error message
        if (uploadError.message?.includes('Payload too large') || 
            uploadError.message?.includes('exceeded the maximum allowed size')) {
          throw new Error(`File size (${fileSizeFormatted}) exceeds Supabase's upload limit. Please compress your file to under 100MB and try again.`);
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
        errorMessage = `File too large: Your file (${fileSize}) exceeds the upload limit. Please compress your Gaussian splat file to under 100MB.`;
      } else if (error.message?.includes('exceeded the maximum allowed size')) {
        errorMessage = `File is too large. Maximum size for ${bucket} is ${formatFileSize(FILE_SIZE_LIMITS[bucket])}.`;
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

  const getFileIcon = () => {
    if (bucket === 'menu-images' || bucket === 'restaurant-branding') {
      return <Image className="w-4 h-4" />;
    }
    if (bucket === 'gaussian-splats') {
      return <Zap className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getFileDescription = () => {
    if (bucket === 'menu-images') return 'Image uploaded';
    if (bucket === 'restaurant-branding') return 'Branding asset uploaded';
    if (bucket === 'gaussian-splats') return 'Gaussian splat uploaded';
    return '3D model uploaded';
  };

  const getUploadPhaseMessage = () => {
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

  const getFileSizeInfo = () => {
    const maxSize = FILE_SIZE_LIMITS[bucket];
    return `Maximum file size: ${formatFileSize(maxSize)}`;
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="text-xs text-gray-500 mb-2">
        {getFileSizeInfo()}
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
        {currentUrl ? (
          <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
            {getFileIcon()}
            <span className="text-sm text-gray-600 flex-1">
              {getFileDescription()}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div>
            <Input
              type="file"
              accept={accept}
              onChange={uploadFile}
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
                {uploading ? getUploadPhaseMessage() : `Click to upload ${label.toLowerCase()}`}
              </span>
            </Label>
            
            {uploading && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{getUploadPhaseMessage()}</span>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
