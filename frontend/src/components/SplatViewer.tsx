import React, { useEffect, useRef, useState } from 'react';

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
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const splatMeshRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadThreeJS = async () => {
      // Check if THREE.js is already loaded
      if ((window as any).THREE) {
        return (window as any).THREE;
      }

      // Load THREE.js from CDN
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.174.0/three.min.js';
        script.onload = () => {
          resolve((window as any).THREE);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeViewer = async () => {
      if (!mountRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load THREE.js
        const THREE = await loadThreeJS();

        if (!mounted || !THREE) return;

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

        // Create an attractive 3D object representing food/menu
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

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          
          animationIdRef.current = requestAnimationFrame(animate);
          
          if (autoRotate && splatMeshRef.current) {
            splatMeshRef.current.rotation.y += 0.01;
            splatMeshRef.current.rotation.x += 0.005;
            
            // Animate particles
            splatMeshRef.current.children.forEach((child: any, index: number) => {
              if (index > 1) { // Skip sphere and wireframe
                child.rotation.x += 0.02;
                child.rotation.y += 0.01;
              }
            });
          }
          
          renderer.render(scene, camera);
        };
        
        animate();
        setIsLoading(false);

      } catch (err) {
        console.error('Error initializing SplatViewer:', err);
        setError('Failed to initialize 3D viewer');
        setIsLoading(false);
      }
    };

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
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">⚠️</div>
          <p className="text-gray-400 text-sm">3D Viewer Error</p>
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