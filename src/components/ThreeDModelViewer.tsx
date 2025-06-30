
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from '@/utils/plyLoader';

interface ModelViewerProps {
  modelData: ArrayBuffer;
  filename: string;
  type: 'ply' | 'splat';
}

const ModelMesh = ({ modelData, type }: { modelData: ArrayBuffer; type: 'ply' | 'splat' }) => {
  const meshRef = useRef<THREE.Points>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ModelMesh: Loading model data, type:', type, 'size:', modelData?.byteLength);
    
    if (!modelData || modelData.byteLength === 0) {
      console.error('ModelMesh: No model data provided');
      setError('No model data provided');
      return;
    }

    if (type === 'ply') {
      try {
        const loader = new PLYLoader();
        const geo = loader.load(modelData);
        
        if (geo) {
          console.log('ModelMesh: PLY loaded successfully, vertices:', geo.attributes.position?.count || 0);
          
          // Ensure proper bounds for the geometry
          geo.computeBoundingBox();
          geo.computeBoundingSphere();
          
          // Center the geometry
          if (geo.boundingBox) {
            const center = geo.boundingBox.getCenter(new THREE.Vector3());
            geo.translate(-center.x, -center.y, -center.z);
          }
          
          setGeometry(geo);
          setError(null);
        } else {
          console.error('ModelMesh: PLY loader returned null');
          setError('Failed to parse PLY file - invalid format');
        }
      } catch (error) {
        console.error('ModelMesh: Failed to load PLY file:', error);
        setError('Error loading PLY file: ' + (error as Error).message);
      }
    } else if (type === 'splat') {
      console.log('ModelMesh: Splat files not yet implemented');
      setError('Gaussian Splat support coming soon');
    } else {
      setError('Unsupported file type: ' + type);
    }

    // Cleanup function
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [modelData, type]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate && !error && geometry) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  if (error) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
    );
  }

  if (!geometry) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
    );
  }

  // Create material for point cloud
  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    sizeAttenuation: true,
    alphaTest: 0.1
  });

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      material={material}
      onClick={() => setAutoRotate(!autoRotate)}
    />
  );
};

const CameraController = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Position camera for optimal viewing
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

const ErrorBoundary = ({ children, error }: { children: React.ReactNode; error?: string }) => {
  if (error) {
    return (
      <div className="w-full h-full bg-red-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="font-medium">3D Model Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export const ThreeDModelViewer = ({ modelData, filename, type }: ModelViewerProps) => {
  const [renderError, setRenderError] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const handleError = (error: any) => {
    console.error('ThreeDModelViewer: Render error:', error);
    setRenderError('Failed to render 3D model: ' + error.message);
  };

  const handleContextLost = () => {
    console.warn('ThreeDModelViewer: WebGL context lost');
    setContextLost(true);
  };

  const handleContextRestored = () => {
    console.log('ThreeDModelViewer: WebGL context restored');
    setContextLost(false);
    setRenderError(null);
  };

  if (contextLost) {
    return (
      <div className="w-full h-full bg-yellow-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-yellow-700">
          <div className="text-2xl mb-2">🔄</div>
          <p className="font-medium">WebGL Context Lost</p>
          <p className="text-sm">Refresh the page to restore 3D rendering</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary error={renderError}>
      <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
        <Canvas
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', handleContextLost);
            gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
          }}
          onError={handleError}
          gl={{ 
            antialias: true, 
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false
          }}
        >
          <CameraController />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <directionalLight position={[0, 10, 0]} intensity={0.3} />
          
          <ModelMesh modelData={modelData} type={type} />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={20}
            minDistance={0.5}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Canvas>
        
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
          {filename} ({type.toUpperCase()})
        </div>
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs">
          Click to stop rotation • Drag to orbit • Scroll to zoom
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ThreeDModelViewer;
