
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
      
      // Show info for large files
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Large File Upload",
          description: `Uploading ${fileSizeFormatted}. This may take a moment...`,
          duration: 3000,
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const startTime = Date.now();
      let progressInterval: NodeJS.Timeout;

      // Create a more realistic progress simulation that completes properly
      const simulateProgress = () => {
        const elapsed = Date.now() - startTime;
        const estimatedDuration = Math.max(3000, file.size / (1024 * 1024) * 1000); // At least 3 seconds, or 1 second per MB
        let progress = Math.min((elapsed / estimatedDuration) * 85, 85); // Cap at 85% during upload
        
        setUploadProgress(progress);
        
        // Calculate and display speed estimate
        if (elapsed > 1000) {
          const estimatedBytesUploaded = (progress / 100) * file.size;
          const avgSpeed = estimatedBytesUploaded / (elapsed / 1000);
          setUploadSpeed(formatSpeed(avgSpeed));
        }
      };

      // Start progress simulation
      progressInterval = setInterval(simulateProgress, 200);

      try {
        console.log('Starting upload for file:', file.name, 'Size:', fileSizeFormatted);
        
        // Perform the actual upload
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

        // Clear progress simulation
        clearInterval(progressInterval);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('Upload completed successfully');
        
        // Set progress to 100% immediately after successful upload
        setUploadProgress(100);

        // Calculate final stats
        const totalTime = (Date.now() - startTime) / 1000;
        const avgSpeed = file.size / totalTime;
        setUploadSpeed(formatSpeed(avgSpeed));

        // Get the public URL
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        console.log('Public URL generated:', data.publicUrl);
        
        // Call the upload callback
        onUpload(data.publicUrl);

        toast({
          title: "Upload Complete",
          description: `${file.name} uploaded successfully (${fileSizeFormatted}) in ${totalTime.toFixed(1)}s`,
          duration: 5000,
        });

      } catch (uploadError) {
        clearInterval(progressInterval);
        console.error('Upload failed:', uploadError);
        throw uploadError;
      }

    } catch (error: any) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || 'An error occurred during upload',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset progress after showing completion
      setTimeout(() => {
        setUploadProgress(0);
        setFileSize('');
        setUploadSpeed('');
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
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                {fileSize && (
                  <div className="text-xs text-gray-500 space-y-1 text-center">
                    <div>File size: {fileSize}</div>
                    {uploadSpeed && <div>Speed: {uploadSpeed}</div>}
                    {bucket === 'gaussian-splats' && (
                      <div className="text-blue-600">Processing compressed PLY file...</div>
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
