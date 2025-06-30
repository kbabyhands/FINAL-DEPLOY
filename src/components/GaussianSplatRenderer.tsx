
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SplatLoader, SplatData } from '@/utils/splatLoader';
import { GaussianSplatMaterial, SplatInstancedGeometry } from '@/utils/gaussianSplatShader';

interface GaussianSplatRendererProps {
  modelData: ArrayBuffer;
  autoRotate: boolean;
}

// LOD system for performance optimization
class SplatLODManager {
  private splatData: SplatData;
  private camera: THREE.Camera;
  private lodLevels: number[] = [1.0, 0.7, 0.4, 0.2]; // Percentage of splats to render at each level
  private currentLOD: number = 0;

  constructor(splatData: SplatData, camera: THREE.Camera) {
    this.splatData = splatData;
    this.camera = camera;
  }

  updateLOD(cameraPosition: THREE.Vector3): number {
    const distance = cameraPosition.distanceTo(this.splatData.bounds.center);
    const maxDim = Math.max(this.splatData.bounds.size.x, this.splatData.bounds.size.y, this.splatData.bounds.size.z);
    
    const normalizedDistance = distance / maxDim;
    
    if (normalizedDistance < 2) {
      this.currentLOD = 0; // Full quality
    } else if (normalizedDistance < 5) {
      this.currentLOD = 1; // High quality
    } else if (normalizedDistance < 10) {
      this.currentLOD = 2; // Medium quality  
    } else {
      this.currentLOD = 3; // Low quality
    }
    
    return Math.floor(this.splatData.count * this.lodLevels[this.currentLOD]);
  }

  getCurrentLOD(): number {
    return this.currentLOD;
  }
}

const GaussianSplatRenderer = ({ modelData, autoRotate }: GaussianSplatRendererProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [splatData, setSplatData] = useState<SplatData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [performanceStats, setPerformanceStats] = useState({ fps: 0, renderTime: 0, splatCount: 0 });
  const { camera } = useThree();
  
  // Performance monitoring
  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef(Date.now());
  const frameCount = useRef(0);

  const lodManager = useMemo(() => {
    if (splatData) {
      return new SplatLODManager(splatData, camera);
    }
    return null;
  }, [splatData, camera]);

  useEffect(() => {
    console.log('GaussianSplatRenderer: Loading splat data, size:', modelData?.byteLength);
    
    if (!modelData || modelData.byteLength === 0) {
      console.error('GaussianSplatRenderer: No model data provided');
      setError('No splat data provided');
      return;
    }

    setLoadingProgress('Processing splat file...');

    // Use adaptive splat count based on file size and performance
    const getMaxSplats = () => {
      const fileSizeMB = modelData.byteLength / (1024 * 1024);
      if (fileSizeMB > 50) return 50000; // Reduced for better performance
      if (fileSizeMB > 20) return 75000; // Medium files  
      return 100000; // Small files
    };
    
    try {
      const loader = new SplatLoader();
      const data = loader.load(modelData, getMaxSplats());
      
      if (data) {
        console.log('GaussianSplatRenderer: Splat loaded successfully');
        console.log('- Count:', data.count);
        console.log('- Bounds:', data.bounds);
        
        // Auto-adjust camera position based on model bounds
        const maxDim = Math.max(data.bounds.size.x, data.bounds.size.y, data.bounds.size.z);
        const distance = maxDim * 2; // Position camera at 2x the max dimension
        
        if (camera) {
          camera.position.set(distance, distance * 0.5, distance);
          camera.lookAt(data.bounds.center.x, data.bounds.center.y, data.bounds.center.z);
          
          if (camera instanceof THREE.PerspectiveCamera) {
            camera.near = maxDim * 0.01;
            camera.far = maxDim * 10;
            camera.updateProjectionMatrix();
          }
        }
        
        setSplatData(data);
        setError(null);
        setLoadingProgress('');
      } else {
        console.error('GaussianSplatRenderer: Splat loader returned null');
        setError('Failed to parse splat file - invalid format or corrupted data');
        setLoadingProgress('');
      }
    } catch (error) {
      console.error('GaussianSplatRenderer: Failed to load splat file:', error);
      setError('Error loading splat file: ' + (error as Error).message);
      setLoadingProgress('');
    }
  }, [modelData, camera]);

  // Create geometry and material
  const { geometry, material } = useMemo(() => {
    if (!splatData) return { geometry: null, material: null };

    const geom = new SplatInstancedGeometry(splatData.count);
    geom.setSplatData(splatData);
    
    const mat = new GaussianSplatMaterial();
    
    return { geometry: geom, material: mat };
  }, [splatData]);

  useFrame((state, delta) => {
    frameCount.current++;
    
    // Performance monitoring
    const currentTime = Date.now();
    const frameTime = currentTime - lastFrameTime.current;
    lastFrameTime.current = currentTime;
    
    frameTimeRef.current.push(frameTime);
    if (frameTimeRef.current.length > 60) {
      frameTimeRef.current.shift();
    }
    
    // Update performance stats every 30 frames
    if (frameCount.current % 30 === 0 && frameTimeRef.current.length > 10) {
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b) / frameTimeRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);
      
      setPerformanceStats(prev => ({
        fps,
        renderTime: Math.round(avgFrameTime * 100) / 100,
        splatCount: lodManager ? Math.floor(splatData?.count || 0 * (lodManager.getCurrentLOD() === 0 ? 1 : 0.7)) : splatData?.count || 0
      }));
    }

    if (meshRef.current && autoRotate && !error && splatData) {
      meshRef.current.rotation.y += delta * 0.3; // Slightly faster rotation
    }

    // Update LOD based on camera distance
    if (lodManager && geometry && splatData) {
      const activeSplatCount = lodManager.updateLOD(camera.position);
      geometry.instanceCount = activeSplatCount;
    }
  });

  // Error state
  if (error) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  // Loading state
  if (!splatData || !geometry || !material) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      </group>
    );
  }

  // Main rendering - Remove the centering translation to let auto-positioning work
  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
      />
      
      {/* Performance debug info - only visible in dev mode */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[2, 2, 0]}>
          <planeGeometry args={[1, 0.5]} />
          <meshBasicMaterial transparent opacity={0.8} color="#000000" />
        </mesh>
      )}
    </group>
  );
};

export default GaussianSplatRenderer;
