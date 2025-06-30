
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PLYLoader } from '@/utils/plyLoader';

interface ThreeDModelViewerProps {
  modelUrl: string;
  title: string;
  className?: string;
}

interface ModelProps {
  modelUrl: string;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string) => void;
}

const Model = ({ modelUrl, onLoadingChange, onError }: ModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      console.log('Starting to load model:', modelUrl);
      
      try {
        onLoadingChange(true);
        onError('');

        let processedUrl = modelUrl;

        // Check if it's a ZIP file
        if (modelUrl.toLowerCase().endsWith('.zip')) {
          console.log('Processing ZIP file...');
          
          const response = await fetch(modelUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch ZIP file: ${response.status} ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          console.log('ZIP file downloaded, size:', arrayBuffer.byteLength);
          
          const zip = new JSZip();
          const zipData = await zip.loadAsync(arrayBuffer);

          // Find the first PLY file in the ZIP
          const plyFile = Object.keys(zipData.files).find(filename =>
            filename.toLowerCase().endsWith('.ply') && !zipData.files[filename].dir
          );

          if (!plyFile) {
            const fileList = Object.keys(zipData.files).filter(f => !zipData.files[f].dir);
            throw new Error(`No PLY file found in ZIP. Found files: ${fileList.join(', ')}`);
          }

          console.log('Found PLY file in ZIP:', plyFile);
          
          const plyData = await zipData.files[plyFile].async('arraybuffer');
          console.log('Extracted PLY data, size:', plyData.byteLength);
          
          const plyBlob = new Blob([plyData], { type: 'application/octet-stream' });
          processedUrl = URL.createObjectURL(plyBlob);
        }

        console.log('Loading PLY file from:', processedUrl);
        const loader = new PLYLoader();
        const loadedGeometry = await loader.load(processedUrl);
        
        console.log('PLY loaded successfully, vertices:', loadedGeometry.getAttribute('position')?.count);
        setGeometry(loadedGeometry);

        // Clean up blob URL if we created one
        if (processedUrl !== modelUrl) {
          URL.revokeObjectURL(processedUrl);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error loading 3D model:', err);
        onError(`Failed to load 3D model: ${errorMessage}`);
      } finally {
        onLoadingChange(false);
      }
    };

    loadModel();
  }, [modelUrl, onLoadingChange, onError]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  if (!geometry) {
    return null;
  }

  return (
    <Center>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial vertexColors />
      </mesh>
    </Center>
  );
};

const ThreeDModelViewer = ({ modelUrl, title, className = '' }: ThreeDModelViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    if (errorMessage) {
      toast({
        title: "3D Model Loading Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

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

  if (!modelUrl) {
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg z-10 p-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600 text-center text-sm max-w-md leading-relaxed">{error}</p>
          <Button
            onClick={() => {
              setError('');
              setIsLoading(true);
              // Force re-render by changing key
              window.location.reload();
            }}
            className="mt-4"
            variant="outline"
            size="sm"
          >
            Retry Loading
          </Button>
        </div>
      )}

      <div className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: '#f8f9fa' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          
          <Suspense fallback={null}>
            <Model 
              modelUrl={modelUrl} 
              onLoadingChange={handleLoadingChange}
              onError={handleError}
            />
          </Suspense>
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
          />
        </Canvas>
      </div>

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

export default ThreeDModelViewer;
