
interface FileValidationResult {
  valid: boolean;
  message?: string;
}

interface FileUploadValidatorProps {
  bucket: 'menu-images' | '3d-models' | 'restaurant-branding' | 'gaussian-splats';
}

// File size limits (in bytes) - Updated for Supabase Pro plan
const FILE_SIZE_LIMITS = {
  'menu-images': 10 * 1024 * 1024, // 10MB
  'restaurant-branding': 10 * 1024 * 1024, // 10MB
  '3d-models': 5 * 1024 * 1024 * 1024, // 5GB for Pro plan
  'gaussian-splats': 5 * 1024 * 1024 * 1024, // 5GB for Pro plan
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
  
  console.log('Validating file:', {
    fileName: file.name,
    fileSize: file.size,
    maxSize: maxSize,
    bucket: bucket
  });
  
  if (file.size > maxSize) {
    if (bucket === 'gaussian-splats' || bucket === '3d-models') {
      return {
        valid: false,
        message: `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${formatFileSize(maxSize)}. With Supabase Pro, you can upload files up to 5GB for 3D models. If your file is larger, consider compressing it or splitting it into sections.`
      };
    }
    
    return {
      valid: false,
      message: `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${formatFileSize(maxSize)}. Please compress your file or use a smaller version.`
    };
  }

  // Check for 3D model specific formats
  if (bucket === 'gaussian-splats' || bucket === '3d-models') {
    const validExtensions = ['.splat', '.ply', '.gz', '.zip'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    console.log('Checking file extension:', fileExtension, 'against valid extensions:', validExtensions);
    
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: 'Please upload a valid 3D model file (.splat, .ply, .gz, or .zip format).'
      };
    }

    // More lenient validation for zip files - just check if it's a zip
    if (fileExtension === '.zip') {
      console.log('ZIP file detected - validation passed');
      // Don't be too strict about filename validation for ZIP files
      // The server will handle the actual content validation
      return { valid: true };
    }
  }

  console.log('File validation passed');
  return { valid: true };
};

export const getFileSizeInfo = (bucket: FileUploadValidatorProps['bucket']): string => {
  const maxSize = FILE_SIZE_LIMITS[bucket];
  return `Pro plan limit: ${formatFileSize(maxSize)}`;
};

export { FILE_SIZE_LIMITS };
