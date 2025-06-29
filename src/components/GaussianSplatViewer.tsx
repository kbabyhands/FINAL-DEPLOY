import React, { useRef, useEffect, useState } from 'react';
import { Viewer } from '@mkkellogg/gaussian-splats-3d';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GaussianSplatViewerProps {
  splatUrl: string;
  title: string;
  className?: string;
}

const GaussianSplatViewer = ({ splatUrl, title, className = '' }: GaussianSplatViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const processFile = async (url: string): Promise<string> => {
    try {
      console.log('Processing file:', url);
      
      // Check if it's a ZIP file by extension or content type
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const isZipFile = url.toLowerCase().endsWith('.zip') || 
                       contentType.includes('application/zip') ||
                       contentType.includes('application/x-zip-compressed');

      if (isZipFile) {
        console.log('Detected ZIP file, extracting...');
        const arrayBuffer = await response.arrayBuffer();
        const zip = new JSZip();
        const zipData = await zip.loadAsync(arrayBuffer);
        
        // Find the first PLY file in the ZIP
        const plyFile = Object.keys(zipData.files).find(filename => 
          filename.toLowerCase().endsWith('.ply')
        );
        
        if (!plyFile) {
          throw new Error('No PLY file found in the ZIP archive');
        }
        
        console.log('Found PLY file in ZIP:', plyFile);
        const plyData = await zipData.files[plyFile].async('uint8array');
        
        // Create a proper blob with PLY MIME type
        const plyBlob = new Blob([plyData], { 
          type: 'model/ply' 
        });
        
        // Create blob URL
        const blobUrl = URL.createObjectURL(plyBlob);
        
        // The library needs to see .ply in the URL, so we'll create a data URL instead
        const base64Data = btoa(String.fromCharCode(...plyData));
        const dataUrl = `data:model/ply;base64,${base64Data}`;
        
        console.log('Created data URL for PLY file');
        return dataUrl;
      } else {
        // Direct PLY file
        console.log('Using direct PLY file');
        return url;
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  };

  const initializeViewer = async () => {
    if (!containerRef.current || !splatUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      // Clean up existing viewer
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }

      // Clear container
      containerRef.current.innerHTML = '';

      // Process the file (handle ZIP if needed)
      const processedUrl = await processFile(splatUrl);
      
      console.log('Processed URL:', processedUrl.substring(0, 100) + '...');

      // Create new viewer with more permissive settings
      const viewer = new Viewer({
        container: containerRef.current,
        gpuAcceleratedSort: true,
        halfPrecisionCovariancesOnGPU: true,
        sharedMemoryForWorkers: false,
        integerBasedSort: true,
        webXRMode: 'none',
        renderMode: 'always',
        sceneRevealMode: 'instant'
      });

      viewerRef.current = viewer;

      // Load the splat scene with additional options
      const sceneOptions = {
        showLoadingUI: true,
        progressiveLoad: true,
        rotation: [0, 0, 0, 1],
        position: [0, 0, 0],
        scale: [1, 1, 1]
      };

      await viewer.addSplatScene(processedUrl, sceneOptions);

      // Start the viewer
      viewer.start();

      console.log('Gaussian Splat viewer initialized successfully');
      
      toast({
        title: "3D Model Loaded",
        description: "The Gaussian Splat model has been loaded successfully"
      });

    } catch (error) {
      console.error('Error initializing Gaussian Splat viewer:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to load 3D model. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('File format not supported')) {
          errorMessage = 'The PLY file format is not supported or corrupted. Please try with a different file.';
        } else if (error.message.includes('No PLY file found')) {
          errorMessage = 'No PLY file found in the ZIP archive. Please ensure your ZIP contains a .ply file.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Loading Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  useEffect(() => {
    if (splatUrl && containerRef.current) {
      initializeViewer();
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, [splatUrl]);

  // Handle fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (!splatUrl) {
    return null;
  }

  const ViewerContent = () => (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <LoadingSpinner size="lg" text="Loading 3D model..." />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg z-10">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600 text-center px-4 max-w-md">{error}</p>
          <Button 
            onClick={initializeViewer} 
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '300px' }}
      />
      
      {!isFullscreen && !isLoading && !error && (
        <Button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 z-20"
          size="sm"
          variant="secondary"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Full
        </Button>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
          <h2 className="text-xl font-semibold">{title} - 3D View</h2>
          <Button
            onClick={closeFullscreen}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 p-4">
          <ViewerContent />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-64 ${className}`}>
      <ViewerContent />
    </div>
  );
};

export default GaussianSplatViewer;
