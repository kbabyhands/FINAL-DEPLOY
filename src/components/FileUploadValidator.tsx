
interface FileValidationResult {
  valid: boolean;
  message?: string;
}

interface FileUploadValidatorProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
}

// File size limits (in bytes) - adjusted for Gaussian splat uploads
const FILE_SIZE_LIMITS = {
  'menu-images': 10 * 1024 * 1024, // 10MB
  'restaurant-branding': 10 * 1024 * 1024, // 10MB
  '3d-models': 50 * 1024 * 1024, // 50MB
  'gaussian-splats': 200 * 1024 * 1024, // Increased to 200MB for Gaussian splat files
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + '/s';
};

export const validateFile = (file: File, bucket: FileUploadValidatorProps['bucket']): FileValidationResult => {
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

export const getFileSizeInfo = (bucket: FileUploadValidatorProps['bucket']): string => {
  const maxSize = FILE_SIZE_LIMITS[bucket];
  return `Maximum file size: ${formatFileSize(maxSize)}`;
};

export { FILE_SIZE_LIMITS };
