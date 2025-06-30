
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

  useEffect(() => {
    if (type === 'ply') {
      const loader = new PLYLoader();
      try {
        const geo = loader.load(modelData);
        setGeometry(geo);
      } catch (error) {
        console.error('Failed to load PLY file:', error);
      }
    }
  }, [modelData, type]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  if (!geometry) {
    return null;
  }

  // Create material for point cloud
  const material = new THREE.PointsMaterial({
    size: 0.01,
    vertexColors: true,
    sizeAttenuation: true
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
  const { camera, gl } = useThree();
  
  useEffect(() => {
    // Position camera for optimal viewing
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

export const ThreeDModelViewer = ({ modelData, filename, type }: ModelViewerProps) => {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas>
        <CameraController />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <ModelMesh modelData={modelData} type={type} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={0.5}
        />
      </Canvas>
      
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {filename} ({type.toUpperCase()})
      </div>
      
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        Click model to toggle auto-rotate
      </div>
    </div>
  );
};

export default ThreeDModelViewer;
