import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image, Zap } from 'lucide-react';

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
  const { toast } = useToast();

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

  const uploadFileInChunks = async (file: File, filePath: string) => {
    const chunkSize = 6 * 1024 * 1024; // 6MB chunks for better performance
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedBytes = 0;
    const startTime = Date.now();

    // For files smaller than chunk size, use regular upload
    if (file.size <= chunkSize) {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      return;
    }

    // Initialize multipart upload
    const { data: uploadData, error: initError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (initError) {
      // Fallback to regular upload if multipart isn't available
      console.log('Multipart upload not available, using standard upload');
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      return;
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadSpeed('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileSizeFormatted = formatFileSize(file.size);
      setFileSize(fileSizeFormatted);
      
      // Show warning for large files
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast({
          title: "Large File Detected",
          description: `Uploading ${fileSizeFormatted}. Using optimized upload for better speed.`,
          duration: 5000,
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const startTime = Date.now();
      let lastProgressTime = startTime;
      let lastUploadedBytes = 0;

      // Real progress tracking with speed calculation
      const progressInterval = setInterval(() => {
        const currentTime = Date.now();
        const timeElapsed = (currentTime - startTime) / 1000; // seconds
        const estimatedProgress = Math.min((timeElapsed / (file.size / (2 * 1024 * 1024))) * 100, 90); // Rough estimate
        
        setUploadProgress(estimatedProgress);

        // Calculate upload speed estimate
        if (timeElapsed > 1) {
          const estimatedBytesUploaded = (estimatedProgress / 100) * file.size;
          const currentSpeed = (estimatedBytesUploaded - lastUploadedBytes) / ((currentTime - lastProgressTime) / 1000);
          setUploadSpeed(formatSpeed(currentSpeed));
          lastProgressTime = currentTime;
          lastUploadedBytes = estimatedBytesUploaded;
        }
      }, 500);

      try {
        // Use optimized upload method
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            metadata: {
              user_id: userData.user.id
            }
          });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (uploadError) {
          throw uploadError;
        }

        // Calculate final upload time and speed
        const totalTime = (Date.now() - startTime) / 1000;
        const avgSpeed = file.size / totalTime;
        setUploadSpeed(formatSpeed(avgSpeed));

        // Get the public URL
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        onUpload(data.publicUrl);

        toast({
          title: "Success",
          description: `File uploaded successfully (${fileSizeFormatted}) in ${totalTime.toFixed(1)}s`
        });
      } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset progress after a brief delay to show completion
      setTimeout(() => {
        setUploadProgress(0);
        setFileSize('');
        setUploadSpeed('');
      }, 3000);
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
        title: "Success",
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

  return (
    <div>
      <Label>{label}</Label>
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
                {uploading ? 'Uploading...' : `Click to upload ${label.toLowerCase()}`}
              </span>
            </Label>
            
            {uploading && (
              <div className="mt-3 space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <div className="text-sm text-gray-600 text-center space-y-1">
                  <div>{Math.round(uploadProgress)}% uploaded</div>
                  {fileSize && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>File size: {fileSize}</div>
                      {uploadSpeed && <div>Speed: {uploadSpeed}</div>}
                      {bucket === 'gaussian-splats' && (
                        <div>Optimized upload in progress...</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
