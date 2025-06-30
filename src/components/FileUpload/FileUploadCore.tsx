
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, formatFileSize, formatSpeed } from '../FileUploadValidator';

interface FileUploadCoreProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
  onUpload: (url: string) => void;
  onUploadStart: () => void;
  onUploadProgress: (progress: number, phase: 'preparing' | 'uploading' | 'finalizing' | 'complete') => void;
  onUploadComplete: () => void;
  onUploadError: (error: string) => void;
  onFileInfo: (size: string, speed: string, isLarge: boolean) => void;
}

export const useFileUploadCore = ({ 
  bucket, 
  onUpload, 
  onUploadStart, 
  onUploadProgress, 
  onUploadComplete, 
  onUploadError,
  onFileInfo 
}: FileUploadCoreProps) => {
  const { toast } = useToast();

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      onUploadStart();
      onUploadProgress(0, 'preparing');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileSizeFormatted = formatFileSize(file.size);
      
      console.log('Starting file upload process:', {
        fileName: file.name,
        fileSize: fileSizeFormatted,
        fileType: file.type,
        bucket: bucket
      });

      // Validate file
      const validation = validateFile(file, bucket);
      if (!validation.valid) {
        console.error('File validation failed:', validation.message);
        throw new Error(validation.message);
      }

      console.log('File validation passed');

      // Server-side size check for Supabase limitations
      const SUPABASE_UPLOAD_LIMIT = 50 * 1024 * 1024; // 50MB is the practical limit
      if (file.size > SUPABASE_UPLOAD_LIMIT) {
        console.error('File size exceeds Supabase limit:', file.size, 'vs', SUPABASE_UPLOAD_LIMIT);
        if (bucket === 'gaussian-splats' || bucket === '3d-models') {
          throw new Error(`File size (${fileSizeFormatted}) exceeds Supabase's upload limit of ${formatFileSize(SUPABASE_UPLOAD_LIMIT)}. For 3D model files, please:\n\n1. Use PLY compression tools to reduce file size\n2. Create ZIP archives of PLY files for better compression\n3. Reduce point density in your 3D scanning software\n4. Consider splitting large scenes into smaller sections\n\nTarget file size should be under 50MB for reliable uploads.`);
        } else {
          throw new Error(`File size (${fileSizeFormatted}) exceeds the upload limit of ${formatFileSize(SUPABASE_UPLOAD_LIMIT)}. Please compress your file and try again.`);
        }
      }

      // Check if it's a large file (over 25MB threshold for progress indication)
      const isLarge = file.size > 25 * 1024 * 1024;
      onFileInfo(fileSizeFormatted, '', isLarge);

      if (isLarge) {
        toast({
          title: "Large File Upload",
          description: `Uploading ${fileSizeFormatted}. This may take several minutes...`,
          duration: 5000,
        });
      }

      // Get file extension and create appropriate filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      console.log('File extension detected:', fileExt);
      
      let fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Add descriptive prefix for ZIP files containing PLY data
      if (fileExt === 'zip' && (bucket === 'gaussian-splats' || bucket === '3d-models')) {
        fileName = `compressed-ply-${Date.now()}-${Math.random().toString(36).substring(2)}.zip`;
        console.log('ZIP file detected for 3D models, using descriptive filename:', fileName);
      }
      
      const filePath = fileName;

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Authentication failed. Please sign in and try again.');
      }
      if (!userData.user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated. Please sign in and try again.');
      }

      console.log('User authenticated:', userData.user.id);
      console.log('Starting upload for file:', file.name, 'Size:', fileSizeFormatted, 'Path:', filePath);
      
      onUploadProgress(0, 'uploading');
      const startTime = Date.now();
      
      // Create metadata object
      const metadata = {
        user_id: userData.user.id,
        original_name: file.name,
        file_type: fileExt || 'unknown',
        is_compressed: fileExt === 'zip' || fileExt === 'gz',
        upload_timestamp: new Date().toISOString()
      };

      console.log('Upload metadata:', metadata);
      
      // Upload with optimized settings for large files
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: metadata
        });

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          error: uploadError
        });
        
        // Enhanced error handling for server limitations
        if (uploadError.message?.includes('Payload too large') || 
            uploadError.message?.includes('exceeded the maximum allowed size') ||
            uploadError.message?.includes('413')) {
          if (bucket === 'gaussian-splats' || bucket === '3d-models') {
            throw new Error(`Server upload limit exceeded (${fileSizeFormatted}). Supabase has a ${formatFileSize(SUPABASE_UPLOAD_LIMIT)} upload limit.\n\nTo fix this:\n• Use PLY compression tools\n• Create ZIP archives of PLY files\n• Reduce point cloud density\n• Split large models into sections\n• Target files under 50MB`);
          } else {
            throw new Error(`Upload limit exceeded (${fileSizeFormatted}). Please compress your file to under ${formatFileSize(SUPABASE_UPLOAD_LIMIT)}.`);
          }
        }
        
        // Handle authentication errors
        if (uploadError.message?.includes('JWT') || uploadError.message?.includes('auth')) {
          throw new Error('Authentication error. Please sign out and sign back in, then try again.');
        }
        
        // Handle bucket/permission errors
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('bucket')) {
          throw new Error(`Storage bucket "${bucket}" not found or not accessible. Please contact support.`);
        }
        
        // Handle file type errors
        if (uploadError.message?.includes('Invalid file type') || uploadError.message?.includes('not allowed')) {
          throw new Error('File type not allowed. Please check that your ZIP file contains PLY or 3D model data.');
        }
        
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      onUploadProgress(100, 'complete');
      
      const totalTime = (Date.now() - startTime) / 1000;
      const avgSpeed = file.size / totalTime;
      onFileInfo(fileSizeFormatted, formatSpeed(avgSpeed), isLarge);

      console.log('Upload completed successfully in', totalTime, 'seconds');

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

      onUploadComplete();

    } catch (error: any) {
      console.error('File upload error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      // Provide specific error messages for common issues
      let errorMessage = error.message;
      
      if (error.message?.includes('Payload too large') || error.message?.includes('413')) {
        if (bucket === 'gaussian-splats' || bucket === '3d-models') {
          errorMessage = `Upload failed: File too large\n\nSupabase has a 50MB upload limit. For 3D models:\n• Compress with PLY tools\n• Create ZIP archives\n• Reduce point density\n• Split large models\n• Target under 50MB`;
        } else {
          errorMessage = `Upload failed: File too large. Please compress to under 50MB.`;
        }
      } else if (error.message?.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Please ensure your file contains valid 3D model data.';
      } else if (error.message?.includes('Duplicate')) {
        errorMessage = 'A file with this name already exists. Please rename your file and try again.';
      } else if (error.message?.includes('auth') || error.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please sign out and sign back in, then try uploading again.';
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 15000,
      });

      onUploadError(errorMessage);
    } finally {
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return { uploadFile };
};
