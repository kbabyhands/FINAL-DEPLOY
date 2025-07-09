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
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadThreeJS = async () => {
      // Check if THREE.js is already loaded
      if ((window as any).THREE) {
        return (window as any).THREE;
      }

      setLoadingStep('Loading THREE.js...');
      // Load THREE.js from CDN
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.174.0/three.min.js';
        script.onload = () => {
          // Wait a bit for THREE to be fully available
          setTimeout(() => {
            const THREE = (window as any).THREE;
            if (THREE && THREE.Scene && THREE.WebGLRenderer) {
              console.log('THREE.js loaded successfully');
              resolve(THREE);
            } else {
              reject(new Error('THREE.js loaded but objects not available'));
            }
          }, 100);
        };
        script.onerror = () => reject(new Error('Failed to load THREE.js'));
        document.head.appendChild(script);
      });
    };

    const loadPLYLoader = async () => {
      setLoadingStep('Loading PLY Loader...');
      // Load PLYLoader from Three.js examples
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.174.0/examples/js/loaders/PLYLoader.js';
        script.onload = () => {
          setTimeout(() => {
            const PLYLoader = (window as any).THREE?.PLYLoader;
            if (PLYLoader) {
              console.log('PLYLoader loaded successfully');
              resolve(PLYLoader);
            } else {
              reject(new Error('PLYLoader not available after loading'));
            }
          }, 100);
        };
        script.onerror = () => reject(new Error('Failed to load PLYLoader'));
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
        if (!mounted || !THREE) {
          throw new Error('THREE.js failed to load');
        }

        // Verify THREE.js objects are available
        if (!THREE.Scene || !THREE.WebGLRenderer || !THREE.PerspectiveCamera) {
          throw new Error('THREE.js objects not properly initialized');
        }

        setLoadingStep('Initializing 3D scene...');

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

        // Check if we have a PLY file to load
        if (splatUrl && (splatUrl.includes('.ply') || splatUrl.endsWith('.ply'))) {
          try {
            setLoadingStep('Loading PLY file...');
            
            // Load PLYLoader
            const PLYLoader = await loadPLYLoader();
            
            if (!PLYLoader) {
              throw new Error('PLYLoader not available');
            }
            
            const loader = new PLYLoader();
            
            // Construct the full URL for file serving
            let fileUrl = splatUrl;
            if (splatUrl.startsWith('/uploads/')) {
              const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
              fileUrl = `${BACKEND_URL}/api/homepage${splatUrl}`;
              console.log('Loading PLY from URL:', fileUrl);
            } else if (splatUrl.startsWith('data:')) {
              // For base64 data, convert to blob URL
              const response = await fetch(splatUrl);
              const blob = await response.blob();
              fileUrl = URL.createObjectURL(blob);
              console.log('Loading PLY from blob URL');
            }
            
            setLoadingStep('Parsing PLY geometry...');
            
            // Test if the file URL is accessible
            try {
              const testResponse = await fetch(fileUrl, { method: 'HEAD' });
              if (!testResponse.ok) {
                throw new Error(`File not accessible: ${testResponse.status} ${testResponse.statusText}`);
              }
            } catch (fetchError) {
              throw new Error(`File access failed: ${fetchError.message}`);
            }
            
            loader.load(
              fileUrl,
              (geometry: any) => {
                console.log('PLY loaded successfully', geometry);
                setLoadingStep('Creating 3D mesh...');
                
                try {
                  // Verify geometry is valid
                  if (!geometry || !geometry.attributes) {
                    throw new Error('Invalid geometry data received');
                  }
                  
                  // Create material for the PLY mesh
                  const material = new THREE.MeshPhongMaterial({ 
                    color: 0x4f46e5,
                    transparent: true,
                    opacity: 0.9,
                    shininess: 100,
                    side: THREE.DoubleSide
                  });
                  
                  // Create mesh from geometry
                  const mesh = new THREE.Mesh(geometry, material);
                  
                  // Center and scale the model
                  geometry.computeBoundingBox();
                  const box = geometry.boundingBox;
                  
                  if (box) {
                    const center = box.getCenter(new THREE.Vector3());
                    geometry.translate(-center.x, -center.y, -center.z);
                    
                    // Scale to fit in view
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.5 / maxDim;
                    mesh.scale.multiplyScalar(scale);
                  }
                  
                  scene.add(mesh);
                  splatMeshRef.current = mesh;
                  
                  setLoadingStep('Complete!');
                  console.log('PLY mesh added to scene successfully');
                  
                } catch (meshError) {
                  console.error('Mesh creation error:', meshError);
                  throw new Error(`Mesh creation failed: ${meshError.message}`);
                }
                
                // Clean up blob URL if created
                if (fileUrl !== splatUrl && fileUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(fileUrl);
                }
              },
              (progress: any) => {
                console.log('PLY loading progress:', progress);
                setLoadingStep('Loading PLY file...');
              },
              (error: any) => {
                console.error('PLY loading error:', error);
                throw new Error(`PLY loading failed: ${error.message || 'Unknown PLY error'}`);
              }
            );
          } catch (plyError) {
            console.error('PLY setup failed:', plyError);
            setError(`PLY setup failed: ${plyError.message || 'Unknown error'}`);
            createDefaultScene(THREE, scene);
          }
        } else {
          // Create default scene for non-PLY files or no file
          setLoadingStep('Creating default scene...');
          createDefaultScene(THREE, scene);
        }

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          
          animationIdRef.current = requestAnimationFrame(animate);
          
          if (autoRotate && splatMeshRef.current) {
            splatMeshRef.current.rotation.y += 0.01;
            splatMeshRef.current.rotation.x += 0.005;
            
            // If it's a group with particles, animate them too
            if (splatMeshRef.current.children) {
              splatMeshRef.current.children.forEach((child: any, index: number) => {
                if (index > 1) { // Skip sphere and wireframe
                  child.rotation.x += 0.02;
                  child.rotation.y += 0.01;
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
        setError(`3D viewer initialization failed: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    // Helper function to create default scene
    const createDefaultScene = (THREE: any, scene: any) => {
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