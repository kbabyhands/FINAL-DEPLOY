
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

  useEffect(() => {
    console.log('GaussianSplatRenderer: Loading splat data, size:', modelData?.byteLength);
    
    if (!modelData || modelData.byteLength === 0) {
      console.error('GaussianSplatRenderer: No model data provided');
      setError('No splat data provided');
      return;
    }

    try {
      const loader = new SplatLoader();
      const data = loader.load(modelData);
      
      if (data) {
        console.log('GaussianSplatRenderer: Splat loaded successfully, count:', data.count);
        setSplatData(data);
        setError(null);
      } else {
        console.error('GaussianSplatRenderer: Splat loader returned null');
        setError('Failed to parse splat file - invalid format');
      }
    } catch (error) {
      console.error('GaussianSplatRenderer: Failed to load splat file:', error);
      setError('Error loading splat file: ' + (error as Error).message);
    }
  }, [modelData]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate && !error && splatData) {
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

  if (!splatData) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
    );
  }

  // Create geometry from splat data
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(splatData.positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(splatData.colors, 3));
  
  // Add custom attributes for Gaussian splat rendering
  geometry.setAttribute('scale', new THREE.BufferAttribute(splatData.scales, 3));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(splatData.opacities, 1));

  // Compute bounds for proper centering and scaling
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  if (geometry.boundingBox && geometry.boundingSphere) {
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
    
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  }

  // Enhanced material for better Gaussian splat visualization
  const material = new THREE.PointsMaterial({
    size: 0.05, // Larger points for splats
    vertexColors: true,
    sizeAttenuation: true,
    alphaTest: 0.1,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending // Better blending for overlapping splats
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
