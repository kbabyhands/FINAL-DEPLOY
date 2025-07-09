import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SplatMesh } from '@sparkjsdev/spark';

interface SplatViewerProps {
  splatUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  autoRotate?: boolean;
}

const SplatViewer: React.FC<SplatViewerProps> = ({ 
  splatUrl, 
  width = 800, 
  height = 400, 
  className = '',
  autoRotate = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const splatMeshRef = useRef<SplatMesh | THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    let mounted = true;

    const initializeViewer = async () => {
      if (!mountRef.current) return;

      try {
        setIsLoading(true);
        setError(null);
        setLoadingStep('Initializing SparkJS...');

        console.log('SparkJS modules loaded successfully');
        setLoadingStep('Creating 3D scene...');

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a); // Dark background to match theme
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 0, 3);
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Clear any existing content
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(renderer.domElement);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Store references
        sceneRef.current = scene;
        rendererRef.current = renderer;

        // Check if we have a splat/PLY file to load
        if (splatUrl && (splatUrl.includes('.ply') || splatUrl.includes('.splat') || splatUrl.includes('.spz') || splatUrl.includes('.ksplat'))) {
          try {
            setLoadingStep('Loading 3D model...');
            
            // Construct the full URL for file serving
            let fileUrl = splatUrl;
            if (splatUrl.startsWith('/uploads/')) {
              const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
              fileUrl = `${BACKEND_URL}/api/homepage${splatUrl}`;
              console.log('Loading model from URL:', fileUrl);
            }
            
            setLoadingStep('Testing file accessibility...');
            
            // Test if the file URL is accessible
            try {
              const testResponse = await fetch(fileUrl, { method: 'HEAD' });
              if (!testResponse.ok) {
                throw new Error(`File not accessible: ${testResponse.status} ${testResponse.statusText}`);
              }
              console.log('File is accessible, size:', testResponse.headers.get('content-length'));
            } catch (fetchError) {
              console.error('File access test failed:', fetchError);
              throw new Error(`File access failed: ${fetchError.message}`);
            }
            
            setLoadingStep('Creating splat mesh...');
            
            // Create SplatMesh with SparkJS with optimization settings
            const splatMesh = new SplatMesh({ 
              url: fileUrl,
              // Optimization settings for faster loading
              alphaTest: 0.1,
              alphaHash: true,
              halfFloat: true,
            });
            
            // Try different rotation combinations to fix orientation
            splatMesh.position.set(0, 0, 0);
            splatMesh.rotation.x = Math.PI; // 180 degrees around X
            splatMesh.rotation.z = Math.PI; // Also try Z-axis rotation
            splatMesh.scale.set(1, 1, 1);
            
            // Add to scene
            scene.add(splatMesh);
            splatMeshRef.current = splatMesh;
            
            setLoadingStep('Complete!');
            console.log('Splat mesh added to scene successfully');
            
          } catch (splatError) {
            console.error('Splat loading failed:', splatError);
            setError(`3D model loading failed: ${splatError.message || 'Unknown error'}`);
            createDefaultScene(scene);
          }
        } else {
          // Create default scene for non-splat files or no file
          setLoadingStep('Creating default scene...');
          createDefaultScene(scene);
        }

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          
          animationIdRef.current = requestAnimationFrame(animate);
          
          if (autoRotate && splatMeshRef.current) {
            // Very slow Y-axis rotation (main rotation)
            splatMeshRef.current.rotation.y += 0.003;
            
            // Subtle circular movement on X-axis using sine wave (keeping it upright)
            const time = Date.now() * 0.001; // Convert to seconds
            splatMeshRef.current.rotation.x = Math.sin(time * 0.5) * 0.05; // Smaller amplitude to prevent flipping
            
            // If it's a group with particles, animate them more subtly too
            if (splatMeshRef.current instanceof THREE.Group && splatMeshRef.current.children) {
              splatMeshRef.current.children.forEach((child: any, index: number) => {
                if (index > 1) { // Skip sphere and wireframe
                  child.rotation.x += 0.005; // Much slower particle rotation
                  child.rotation.y += 0.003;
                }
              });
            }
          }
          
          renderer.render(scene, camera);
        };
        
        animate();
        setIsLoading(false);

      } catch (err) {
        console.error('Error initializing SplatViewer:', err);
        setError(`SparkJS initialization failed: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    // Helper function to create default scene
    const createDefaultScene = (scene: THREE.Scene) => {
      const group = new THREE.Group();

      // Main sphere (represents 3D food model)
      const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      group.add(sphere);
      
      // Wireframe overlay for tech aesthetic
      const wireframeGeometry = new THREE.SphereGeometry(0.82, 16, 16);
      const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x60a5fa, 
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      group.add(wireframe);

      // Add some floating particles around the sphere
      const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.6
      });

      for (let i = 0; i < 20; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        );
        group.add(particle);
      }

      scene.add(group);
      splatMeshRef.current = group;
    };

    // Initialize the viewer
    initializeViewer();

    return () => {
      mounted = false;
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [splatUrl, width, height, autoRotate]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-gray-700 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="text-red-400 text-lg mb-2">⚠️</div>
          <p className="text-gray-400 text-sm mb-2">3D Viewer Error</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-gray-700 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading 3D Model...</p>
          {loadingStep && (
            <p className="text-gray-500 text-xs mt-1">{loadingStep}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mountRef} 
      className={`rounded-2xl overflow-hidden border-2 border-gray-700 ${className}`}
      style={{ width, height }}
    />
  );
};

export default SplatViewer;