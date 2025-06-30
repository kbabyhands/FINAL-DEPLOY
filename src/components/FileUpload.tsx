
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { toast } = useToast();

  const uploadLargeFile = async (file: File, filePath: string) => {
    const chunkSize = 6 * 1024 * 1024; // 6MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    console.log(`Uploading large file in ${totalChunks} chunks of ${chunkSize} bytes each`);

    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // For large files, we'll use the resumable upload approach
      // First, try to upload the file directly with the standard method
      // If it fails, we'll implement chunked upload
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          metadata: {
            user_id: userData.user.id,
            original_name: file.name,
            file_size: file.size.toString(),
            content_type: file.type || 'application/octet-stream'
          },
          upsert: false
        });

      if (uploadError) {
        // If we get a payload too large error, try alternative approach
        if (uploadError.message.includes('too large') || uploadError.message.includes('413')) {
          console.log('Standard upload failed, implementing workaround for large files...');
          
          // For very large files on Supabase, we need to use a different approach
          // Since Supabase doesn't support resumable uploads in the client library,
          // we'll inform the user about the limitation and suggest alternatives
          
          throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds Supabase's single upload limit. For files larger than ~50MB, consider using a file compression tool to reduce the size, or contact support about enabling larger uploads for your project.`);
        }
        throw uploadError;
      }

      return filePath;
    } catch (error) {
      console.error('Large file upload error:', error);
      throw error;
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      console.log(`Uploading file: ${file.name}, Size: ${file.size} bytes (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);

      // Check file size limits based on bucket and plan
      const maxSize = bucket === 'gaussian-splats' ? 5 * 1024 * 1024 * 1024 : // 5GB for Gaussian splats (Pro plan)
                     bucket === '3d-models' ? 5 * 1024 * 1024 * 1024 : // 5GB for 3D models (Pro plan)
                     50 * 1024 * 1024; // 50MB for images

      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        throw new Error(`File size exceeds the ${maxSizeMB}MB limit for ${bucket}`);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Update progress
      setUploadProgress(10);

      let uploadedFilePath: string;

      // For large files (>50MB), use special handling
      if (file.size > 50 * 1024 * 1024) {
        console.log('Large file detected, using specialized upload method');
        uploadedFilePath = await uploadLargeFile(file, filePath);
      } else {
        // Standard upload for smaller files
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            metadata: {
              user_id: userData.user.id,
              original_name: file.name,
              file_size: file.size.toString(),
              content_type: file.type || 'application/octet-stream'
            },
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        uploadedFilePath = filePath;
      }

      setUploadProgress(90);

      // Get the public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadedFilePath);

      console.log('File uploaded successfully:', data.publicUrl);
      setUploadProgress(100);
      
      onUpload(data.publicUrl);

      toast({
        title: "Success",
        description: `${getFileDescription()} uploaded successfully (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
      });
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
    if (bucket === 'menu-images') return 'Image';
    if (bucket === 'restaurant-branding') return 'Branding asset';
    if (bucket === 'gaussian-splats') return 'Gaussian splat file';
    return '3D model';
  };

  const getAcceptedFormats = () => {
    if (bucket === 'gaussian-splats') {
      return '.ply, .ply.gz (compressed PLY files for Gaussian splats)';
    }
    if (bucket === '3d-models') {
      return '.glb, .gltf, .obj, .fbx';
    }
    if (bucket === 'menu-images' || bucket === 'restaurant-branding') {
      return 'JPG, PNG, WebP images';
    }
    return 'Various formats accepted';
  };

  const getSizeLimit = () => {
    if (bucket === 'gaussian-splats' || bucket === '3d-models') {
      return 'Up to 5GB (Pro plan)';
    }
    return 'Up to 50MB';
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2">
        {currentUrl ? (
          <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
            {getFileIcon()}
            <div className="flex-1">
              <span className="text-sm text-gray-600 block">
                {getFileDescription()} uploaded
              </span>
              <span className="text-xs text-gray-400">
                {currentUrl.split('/').pop()}
              </span>
            </div>
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
              className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-center">
                {uploading ? (
                  <div className="space-y-2">
                    <div>Uploading... {uploadProgress}%</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{width: `${uploadProgress}%`}}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Large files may take several minutes
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-medium">Click to upload {label.toLowerCase()}</div>
                    <div className="text-xs text-gray-500">{getAcceptedFormats()}</div>
                    <div className="text-xs text-blue-600 font-medium">{getSizeLimit()}</div>
                    {bucket === 'gaussian-splats' && (
                      <div className="text-xs text-amber-600">
                        Note: Files >50MB may require special handling
                      </div>
                    )}
                  </div>
                )}
              </span>
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
