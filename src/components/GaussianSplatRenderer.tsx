
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
  const { camera, size, gl, viewport } = useThree();

  // Responsive splat count based on screen size and device performance
  const adaptiveSplatCount = useMemo(() => {
    const pixelCount = size.width * size.height;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    
    // Adjust splat count based on screen resolution and device capabilities
    if (pixelCount < 500000) { // Small screens (mobile)
      return Math.floor(50000 / devicePixelRatio);
    } else if (pixelCount < 1000000) { // Medium screens (tablet)
      return Math.floor(100000 / devicePixelRatio);
    } else if (pixelCount < 2000000) { // Large screens (desktop)
      return Math.floor(150000 / devicePixelRatio);
    } else { // Very large screens
      return 200000;
    }
  }, [size.width, size.height]);

  useEffect(() => {
    console.log('Loading splat data, size:', modelData?.byteLength);
    console.log('Adaptive splat count:', adaptiveSplatCount);
    
    if (!modelData || modelData.byteLength === 0) {
      setError('No splat data provided');
      return;
    }

    try {
      const loader = new SplatLoader();
      const data = loader.load(modelData, adaptiveSplatCount);
      
      if (data) {
        console.log('Splat loaded successfully');
        console.log('Count:', data.count);
        console.log('Bounds:', data.bounds);
        
        // Responsive camera positioning
        const center = data.bounds.center;
        const maxDim = Math.max(data.bounds.size.x, data.bounds.size.y, data.bounds.size.z);
        
        // Adjust distance based on viewport aspect ratio
        const aspectRatio = size.width / size.height;
        const baseDistance = maxDim * 2;
        const distance = aspectRatio < 1 ? baseDistance * 1.5 : baseDistance; // Further on mobile
        
        camera.position.set(
          distance * 0.8, 
          distance * (aspectRatio < 1 ? 0.5 : 0.3), // Higher on mobile
          distance * 0.8
        );
        camera.lookAt(center.x, center.y, center.z);
        
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.near = maxDim * 0.01;
          camera.far = maxDim * 20;
          // Responsive FOV
          camera.fov = aspectRatio < 1 ? 55 : 45; // Wider FOV on mobile
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
  }, [modelData, camera, adaptiveSplatCount, size]);

  const { geometry, material } = useMemo(() => {
    if (!splatData) return { geometry: null, material: null };

    const geom = new SplatInstancedGeometry(splatData.count);
    geom.setSplatData(splatData);
    
    const mat = new GaussianSplatMaterial();
    mat.updateScreenSize(size.width, size.height);
    mat.updateDevicePixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    
    return { geometry: geom, material: mat };
  }, [splatData, size]);

  // Optimize WebGL for responsive rendering
  useEffect(() => {
    if (gl) {
      gl.sortObjects = false;
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.setClearColor(0x000000, 1);
      
      // Adaptive pixel ratio based on performance
      const adaptivePixelRatio = size.width * size.height > 1000000 ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      gl.setPixelRatio(adaptivePixelRatio);
    }
  }, [gl, size]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate && !error && splatData) {
      // Slower rotation on smaller screens for better viewing
      const rotationSpeed = size.width < 768 ? 0.3 : 0.5;
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
    
    if (material) {
      material.updateScreenSize(size.width, size.height);
      material.updateTime(state.clock.elapsedTime);
      material.updateViewportSize(viewport.width, viewport.height);
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
