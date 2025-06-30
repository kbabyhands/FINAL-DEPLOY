
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SplatLoader, SplatData } from '@/utils/splatLoader';
import { GaussianSplatMaterial, SplatInstancedGeometry } from '@/utils/gaussianSplatShader';

interface GaussianSplatRendererProps {
  modelData: ArrayBuffer;
  autoRotate: boolean;
}

const GaussianSplatRenderer = ({ modelData, autoRotate }: GaussianSplatRendererProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [splatData, setSplatData] = useState<SplatData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { camera, size } = useThree();

  useEffect(() => {
    console.log('Loading splat data, size:', modelData?.byteLength);
    
    if (!modelData || modelData.byteLength === 0) {
      setError('No splat data provided');
      return;
    }

    try {
      const loader = new SplatLoader();
      const data = loader.load(modelData, 30000); // Reduced for better performance
      
      if (data) {
        console.log('Splat loaded successfully');
        console.log('Count:', data.count);
        console.log('Bounds:', data.bounds);
        
        // Position camera appropriately
        const maxDim = Math.max(data.bounds.size.x, data.bounds.size.y, data.bounds.size.z);
        const distance = maxDim * 3;
        
        camera.position.set(distance, distance * 0.5, distance);
        camera.lookAt(data.bounds.center.x, data.bounds.center.y, data.bounds.center.z);
        
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.near = maxDim * 0.01;
          camera.far = maxDim * 10;
          camera.updateProjectionMatrix();
        }
        
        setSplatData(data);
        setError(null);
      } else {
        setError('Failed to parse splat file');
      }
    } catch (error) {
      console.error('Failed to load splat file:', error);
      setError('Error loading splat file: ' + (error as Error).message);
    }
  }, [modelData, camera]);

  const { geometry, material } = useMemo(() => {
    if (!splatData) return { geometry: null, material: null };

    const geom = new SplatInstancedGeometry(splatData.count);
    geom.setSplatData(splatData);
    
    const mat = new GaussianSplatMaterial();
    mat.updateScreenSize(size.width, size.height);
    
    return { geometry: geom, material: mat };
  }, [splatData, size]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate && !error && splatData) {
      meshRef.current.rotation.y += delta * 0.3;
    }
    
    // Update screen size for shader
    if (material) {
      material.updateScreenSize(size.width, size.height);
    }
  });

  if (error) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.5, 0.1]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
    );
  }

  if (!splatData || !geometry || !material) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
    );
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[-splatData.bounds.center.x, -splatData.bounds.center.y, -splatData.bounds.center.z]}
    />
  );
};

export default GaussianSplatRenderer;
