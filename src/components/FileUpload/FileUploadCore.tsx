
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
      
      console.log('Starting file upload with Supabase Pro plan:', {
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

      console.log('File validation passed for Supabase Pro plan');

      // Check for large files (Pro plan supports up to 5GB for 3D models)
      const isLargeFile = file.size > 100 * 1024 * 1024; // Consider 100MB+ as large
      
      onFileInfo(fileSizeFormatted, '', isLargeFile);

      if (isLargeFile) {
        toast({
          title: "Large File Upload (Pro Plan)",
          description: `Uploading ${fileSizeFormatted}. Your Pro plan supports files up to 5GB!`,
          duration: 5000,
        });
      }

      // Get file extension and create appropriate filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      console.log('File extension detected:', fileExt);
      
      let fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Add descriptive prefix for 3D model files
      if (bucket === 'gaussian-splats' || bucket === '3d-models') {
        fileName = `pro-3d-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        console.log('3D model file for Pro plan:', fileName);
      }
      
      const filePath = fileName;

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Authentication required. Please sign in and try again.');
      }
      if (!userData.user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated. Please sign in and try again.');
      }

      console.log('User authenticated for Pro plan upload:', userData.user.id);
      console.log('Starting Pro plan upload:', file.name, 'Size:', fileSizeFormatted, 'Path:', filePath);
      
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
      
      // Upload with Pro plan optimizations
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: metadata
        });

      if (uploadError) {
        console.error('Pro plan upload error:', {
          message: uploadError.message,
          error: uploadError
        });
        
        // Enhanced error handling for Pro plan
        if (uploadError.message?.includes('Payload too large') || 
            uploadError.message?.includes('exceeded the maximum allowed size') ||
            uploadError.message?.includes('413')) {
          throw new Error(`Upload failed: File size (${fileSizeFormatted}) may exceed limits. With Pro plan, 3D models support up to 5GB. Please verify your file isn't corrupted.`);
        }
        
        // Handle authentication errors
        if (uploadError.message?.includes('JWT') || uploadError.message?.includes('auth')) {
          throw new Error('Authentication error. Please sign out and sign back in, then try again.');
        }
        
        throw new Error(`Upload failed: ${uploadError.message}`);
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
        description: `${file.name} uploaded successfully (${fileSizeFormatted})`,
        duration: 5000,
      });

      onUploadComplete();

    } catch (error: any) {
      console.error('File upload error:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      // Provide specific error messages
      let errorMessage = error.message;
      
      if (error.message?.includes('Payload too large') || error.message?.includes('413')) {
        errorMessage = `Upload failed: File too large. Pro plan supports up to 5GB for 3D models.`;
      } else if (error.message?.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Please ensure your file is a valid format.';
      } else if (error.message?.includes('Duplicate')) {
        errorMessage = 'A file with this name already exists. Please rename your file and try again.';
      } else if (error.message?.includes('auth') || error.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please sign out and sign back in, then try uploading again.';
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
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
