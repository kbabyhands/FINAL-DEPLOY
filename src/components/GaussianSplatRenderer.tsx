
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SplatLoader, SplatData } from '@/utils/splatLoader';

interface GaussianSplatRendererProps {
  modelData: ArrayBuffer;
  autoRotate: boolean;
}

const GaussianSplatRenderer = ({ modelData, autoRotate }: GaussianSplatRendererProps) => {
  const meshRef = useRef<THREE.Points>(null);
  const [splatData, setSplatData] = useState<SplatData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  useEffect(() => {
    console.log('GaussianSplatRenderer: Loading splat data, size:', modelData?.byteLength);
    
    if (!modelData || modelData.byteLength === 0) {
      console.error('GaussianSplatRenderer: No model data provided');
      setError('No splat data provided');
      return;
    }

    setLoadingProgress('Processing splat file...');

    // Use a smaller number of splats for better performance
    // Large files will be sampled to maintain responsiveness
    const maxSplats = modelData.byteLength > 10000000 ? 50000 : 150000; // 50k for files > 10MB, 150k otherwise
    
    try {
      const loader = new SplatLoader();
      const data = loader.load(modelData, maxSplats);
      
      if (data) {
        console.log('GaussianSplatRenderer: Splat loaded successfully, count:', data.count);
        setSplatData(data);
        setError(null);
        setLoadingProgress('');
      } else {
        console.error('GaussianSplatRenderer: Splat loader returned null');
        setError('Failed to parse splat file - invalid format');
        setLoadingProgress('');
      }
    } catch (error) {
      console.error('GaussianSplatRenderer: Failed to load splat file:', error);
      setError('Error loading splat file: ' + (error as Error).message);
      setLoadingProgress('');
    }
  }, [modelData]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate && !error && splatData) {
      meshRef.current.rotation.y += delta * 0.5; // Slightly faster rotation
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

  if (!splatData) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
    );
  }

  // Create geometry from splat data with performance optimizations
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(splatData.positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(splatData.colors, 3));
  
  // Add custom attributes for Gaussian splat rendering
  geometry.setAttribute('scale', new THREE.BufferAttribute(splatData.scales, 3));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(splatData.opacities, 1));

  // Compute bounds for proper centering and scaling
  geometry.computeBoundingBox();
  
  if (geometry.boundingBox) {
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    console.log('GaussianSplatRenderer: Bounds - Center:', center, 'Size:', size, 'Max dimension:', maxDim);
    
    // Center and scale the geometry
    geometry.translate(-center.x, -center.y, -center.z);
    
    if (maxDim > 0) {
      const targetSize = 4;
      const scale = targetSize / maxDim;
      geometry.scale(scale, scale, scale);
      console.log('GaussianSplatRenderer: Applied scale factor:', scale);
    }
  }

  // Optimized material for better performance
  const material = new THREE.PointsMaterial({
    size: 0.08, // Slightly larger points to compensate for fewer splats
    vertexColors: true,
    sizeAttenuation: true,
    alphaTest: 0.2, // Higher alpha test for better performance
    transparent: true,
    opacity: 0.9,
    blending: THREE.NormalBlending // Normal blending for better performance than additive
  });

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      material={material}
    />
  );
};

export default GaussianSplatRenderer;
