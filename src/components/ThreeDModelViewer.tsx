import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from '@/utils/plyLoader';
import GaussianSplatRenderer from './GaussianSplatRenderer';

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
          
          // Center and scale the geometry appropriately
          if (geo.boundingBox && geo.boundingSphere) {
            const center = geo.boundingBox.getCenter(new THREE.Vector3());
            const size = geo.boundingBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            console.log('ModelMesh: Original bounds - Center:', center, 'Size:', size, 'Max dimension:', maxDim);
            
            // Center the geometry
            geo.translate(-center.x, -center.y, -center.z);
            
            // Scale to fit in a reasonable size (normalize to ~4 units for better visibility)
            if (maxDim > 0) {
              const targetSize = 4;
              const scale = targetSize / maxDim;
              geo.scale(scale, scale, scale);
              console.log('ModelMesh: Applied scale factor:', scale);
            }
            
            // Recompute bounds after transformations
            geo.computeBoundingBox();
            geo.computeBoundingSphere();
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
    }

    // Cleanup function
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [modelData, type]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate && !error && geometry && type === 'ply') {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  // Handle Gaussian splats with dedicated renderer
  if (type === 'splat') {
    return (
      <GaussianSplatRenderer 
        modelData={modelData} 
        autoRotate={autoRotate}
      />
    );
  }

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

  // Create material for point cloud with enhanced visibility
  const material = new THREE.PointsMaterial({
    size: 0.02, // Increased point size
    vertexColors: true,
    sizeAttenuation: true,
    alphaTest: 0.1,
    transparent: false
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

const ResponsiveCameraController = () => {
  const { camera, size } = useThree();
  
  useEffect(() => {
    // Responsive camera positioning
    const aspectRatio = size.width / size.height;
    const isMobile = size.width < 768;
    
    if (isMobile) {
      camera.position.set(4, 4, 4);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = 60; // Wider FOV for mobile
      }
    } else {
      camera.position.set(3, 3, 3);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = 45;
      }
    }
    
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    
    // Set appropriate near/far planes
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = 0.01;
      camera.far = 1000;
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);

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
            
            // Enhanced WebGL settings for responsive rendering
            gl.getContext().getExtension('OES_element_index_uint');
            gl.getContext().getExtension('WEBGL_depth_texture');
            gl.sortObjects = false;
          }}
          onError={handleError}
          gl={{ 
            antialias: window.innerWidth > 1200, // Conditional antialiasing
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
            precision: window.innerWidth > 768 ? "highp" : "mediump" // Adaptive precision
          }}
          camera={{ position: [3, 3, 3], fov: 60, near: 0.01, far: 1000 }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]} // Adaptive pixel ratio
        >
          <ResponsiveCameraController />
          
          {/* Optimized lighting for splat rendering */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.4} />
          
          <ModelMesh modelData={modelData} type={type} />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={100}
            minDistance={0.1}
            autoRotate={false}
            autoRotateSpeed={0.5}
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.05}
            // Responsive touch settings
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN
            }}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN
            }}
          />
        </Canvas>
        
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs sm:text-sm">
          {filename} ({type.toUpperCase()})
        </div>
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs hidden sm:block">
          {type === 'splat' ? 'Gaussian Splat Viewer' : 'Point Cloud Viewer'} • Drag to orbit • Scroll to zoom
        </div>
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs sm:hidden">
          Touch to control
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ThreeDModelViewer;
