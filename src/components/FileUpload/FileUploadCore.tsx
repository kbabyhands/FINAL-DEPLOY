
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
      
      console.log('Starting file upload process with Pro plan:', {
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

      console.log('File validation passed for Pro plan');

      // Pro plan allows much larger uploads - 5GB for 3D models
      const SUPABASE_PRO_UPLOAD_LIMIT = 5 * 1024 * 1024 * 1024; // 5GB
      const isLargeFile = file.size > 100 * 1024 * 1024; // Consider 100MB+ as large
      
      if (file.size > SUPABASE_PRO_UPLOAD_LIMIT && (bucket === 'gaussian-splats' || bucket === '3d-models')) {
        console.error('File size exceeds Pro plan limit:', file.size, 'vs', SUPABASE_PRO_UPLOAD_LIMIT);
        throw new Error(`File size (${fileSizeFormatted}) exceeds Supabase Pro plan's upload limit of ${formatFileSize(SUPABASE_PRO_UPLOAD_LIMIT)}. Even with Pro plan, files over 5GB need special handling.`);
      }

      onFileInfo(fileSizeFormatted, '', isLargeFile);

      if (isLargeFile) {
        toast({
          title: "Large File Upload (Pro Plan)",
          description: `Uploading ${fileSizeFormatted}. With your Pro plan, this should work much better than before!`,
          duration: 5000,
        });
      }

      // Get file extension and create appropriate filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      console.log('File extension detected:', fileExt);
      
      let fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Add descriptive prefix for ZIP files containing PLY data
      if (fileExt === 'zip' && (bucket === 'gaussian-splats' || bucket === '3d-models')) {
        fileName = `pro-plan-3d-${Date.now()}-${Math.random().toString(36).substring(2)}.zip`;
        console.log('Large 3D model ZIP file for Pro plan:', fileName);
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

      console.log('User authenticated for Pro plan upload:', userData.user.id);
      console.log('Starting Pro plan upload for file:', file.name, 'Size:', fileSizeFormatted, 'Path:', filePath);
      
      onUploadProgress(0, 'uploading');
      const startTime = Date.now();
      
      // Create metadata object
      const metadata = {
        user_id: userData.user.id,
        original_name: file.name,
        file_type: fileExt || 'unknown',
        is_compressed: fileExt === 'zip' || fileExt === 'gz',
        upload_timestamp: new Date().toISOString(),
        plan: 'pro'
      };

      console.log('Pro plan upload metadata:', metadata);
      
      // Upload with optimized settings for Pro plan large files
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: metadata
        });

      if (uploadError) {
        console.error('Pro plan upload error details:', {
          message: uploadError.message,
          error: uploadError
        });
        
        // Enhanced error handling for Pro plan
        if (uploadError.message?.includes('Payload too large') || 
            uploadError.message?.includes('exceeded the maximum allowed size') ||
            uploadError.message?.includes('413')) {
          throw new Error(`Upload failed even with Pro plan (${fileSizeFormatted}). The file might be corrupted or in an unsupported format. Try:\n• Verify the file isn't corrupted\n• Use PLY compression tools\n• Contact support if the file is under 5GB`);
        }
        
        // Handle authentication errors
        if (uploadError.message?.includes('JWT') || uploadError.message?.includes('auth')) {
          throw new Error('Authentication error. Please sign out and sign back in, then try again.');
        }
        
        throw new Error(`Pro plan upload failed: ${uploadError.message}`);
      }

      onUploadProgress(100, 'complete');
      
      const totalTime = (Date.now() - startTime) / 1000;
      const avgSpeed = file.size / totalTime;
      onFileInfo(fileSizeFormatted, formatSpeed(avgSpeed), isLargeFile);

      console.log('Pro plan upload completed successfully in', totalTime, 'seconds');

      // Get the public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Pro plan public URL generated:', data.publicUrl);
      
      // Call the upload callback
      onUpload(data.publicUrl);

      toast({
        title: "Pro Plan Upload Complete! 🎉",
        description: `${file.name} uploaded successfully (${fileSizeFormatted}) with your Pro plan benefits`,
        duration: 5000,
      });

      onUploadComplete();

    } catch (error: any) {
      console.error('Pro plan file upload error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      // Provide specific error messages for Pro plan
      let errorMessage = error.message;
      
      if (error.message?.includes('Payload too large') || error.message?.includes('413')) {
        errorMessage = `Upload failed: Even with Pro plan, this file is too large or corrupted. Pro plan supports up to 5GB for 3D models.`;
      } else if (error.message?.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Please ensure your file contains valid 3D model data.';
      } else if (error.message?.includes('Duplicate')) {
        errorMessage = 'A file with this name already exists. Please rename your file and try again.';
      } else if (error.message?.includes('auth') || error.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please sign out and sign back in, then try uploading again.';
      }
      
      toast({
        title: "Pro Plan Upload Failed",
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
