
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import { FileProcessor, ProcessedFile } from '@/utils/fileProcessor';
import { useToast } from '@/hooks/use-toast';

interface ModelFileUploadProps {
  onFileProcessed: (file: ProcessedFile) => void;
}

export const ModelFileUpload = ({ onFileProcessed }: ModelFileUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<ProcessedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const processedFile = await FileProcessor.processFile(file);
      setUploadedFile(processedFile);
      onFileProcessed(processedFile);
      
      toast({
        title: "File processed successfully",
        description: `${processedFile.filename} is ready to view`,
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : uploadedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".ply,.gz,.zip"
            onChange={handleFileInput}
            className="hidden"
            disabled={isProcessing}
          />
          
          {isProcessing ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Processing file...</p>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-2">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
              <p className="text-green-700 font-medium">{uploadedFile.filename}</p>
              <p className="text-sm text-gray-600">
                PLY file ready
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
              >
                Upload Different File
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-gray-600">
                Drop your PLY file here or click to upload
              </p>
              <p className="text-sm text-gray-400">
                Supports .ply, .ply.gz, and .zip files
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <File className="w-3 h-3" />
          <span>Supported formats:</span>
        </div>
        <ul className="ml-5 space-y-1">
          <li>• .ply - Polygon File Format</li>
          <li>• .ply.gz - Compressed PLY files</li>
          <li>• .zip - Archives containing PLY files</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelFileUpload;
