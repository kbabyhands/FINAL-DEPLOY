
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
  recommendedSize?: string;
  description?: string;
}

const FileUpload = ({ bucket, currentUrl, onUpload, onRemove, label, accept }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          metadata: {
            user_id: userData.user.id
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>
                {uploading ? 'Uploading...' : `Click to upload ${label.toLowerCase()}`}
              </span>
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
