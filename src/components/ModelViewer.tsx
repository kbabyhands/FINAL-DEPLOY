
import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [isRotating, setIsRotating] = useState(true);
  
  // Load the 3D model
  const { scene } = useGLTF(url);
  
  // Auto-rotate the model
  useFrame((state, delta) => {
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group 
      ref={meshRef} 
      onClick={() => setIsRotating(!isRotating)}
      scale={[2, 2, 2]}
      position={[0, -1, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightgray" wireframe />
    </mesh>
  );
}

interface ModelViewerProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  itemTitle: string;
}

const ModelViewer = ({ isOpen, onClose, modelUrl, itemTitle }: ModelViewerProps) => {
  const controlsRef = useRef<any>(null);

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(0.8);
      controlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(0.8);
      controlsRef.current.update();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{itemTitle} - 3D View</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative">
          {/* 3D Canvas */}
          <div className="h-[500px] w-full bg-gradient-to-b from-gray-50 to-gray-100">
            <Canvas
              camera={{ 
                position: [0, 0, 5], 
                fov: 50,
                near: 0.1,
                far: 1000
              }}
              shadows
            >
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              
              {/* Environment */}
              <Environment preset="studio" />
              
              {/* 3D Model */}
              <Suspense fallback={<LoadingFallback />}>
                <Model url={modelUrl} />
              </Suspense>
              
              {/* Ground shadow */}
              <ContactShadows
                position={[0, -2, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4}
              />
              
              {/* Camera controls */}
              <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 1.8}
              />
            </Canvas>
          </div>
          
          {/* Control buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              className="bg-white/90 hover:bg-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomIn}
              className="bg-white/90 hover:bg-white"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomOut}
              className="bg-white/90 hover:bg-white"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
            <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click model to pause rotation</p>
          </div>
        </div>
        
        <div className="p-6 pt-4">
          <p className="text-gray-600 text-sm text-center">
            Drag to rotate the model, scroll to zoom, and click the model to pause/resume auto-rotation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelViewer;
