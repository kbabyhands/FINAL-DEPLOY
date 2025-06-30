
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
  const { camera, size, gl } = useThree();

  useEffect(() => {
    console.log('Loading splat data, size:', modelData?.byteLength);
    
    if (!modelData || modelData.byteLength === 0) {
      setError('No splat data provided');
      return;
    }

    try {
      const loader = new SplatLoader();
      const data = loader.load(modelData, 100000); // Increased limit for better quality
      
      if (data) {
        console.log('Splat loaded successfully');
        console.log('Count:', data.count);
        console.log('Bounds:', data.bounds);
        
        // Fix coordinate system - flip Y to correct upside-down orientation
        const positions = data.positions;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] = -positions[i]; // Flip Y coordinate
        }
        
        // Update bounds after flipping
        const temp = data.bounds.min.y;
        data.bounds.min.y = -data.bounds.max.y;
        data.bounds.max.y = -temp;
        data.bounds.center.y = -data.bounds.center.y;
        
        // Position camera appropriately
        const maxDim = Math.max(data.bounds.size.x, data.bounds.size.y, data.bounds.size.z);
        const distance = maxDim * 1.5; // Closer camera for better detail
        
        camera.position.set(distance * 0.6, distance * 0.2, distance * 0.6);
        camera.lookAt(data.bounds.center.x, data.bounds.center.y, data.bounds.center.z);
        
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.near = maxDim * 0.001;
          camera.far = maxDim * 10;
          camera.fov = 50;
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

  // Optimize WebGL settings for better performance
  useEffect(() => {
    if (gl) {
      gl.sortObjects = false; // Important for transparency
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.0;
    }
  }, [gl]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate && !error && splatData) {
      meshRef.current.rotation.y += delta * 0.3; // Slightly faster rotation
    }
    
    // Update material uniforms for responsive rendering
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
