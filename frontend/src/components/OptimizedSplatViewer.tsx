// Optimized SparkJS viewer with performance enhancements
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sparkJSLoader, SparkJSModules } from '../services/sparkjs-loader';

interface OptimizedSplatViewerProps {
  splatUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  autoRotate?: boolean;
  enableControls?: boolean;
}

const OptimizedSplatViewer: React.FC<OptimizedSplatViewerProps> = ({ 
  splatUrl, 
  width = 800, 
  height = 400, 
  className = '',
  autoRotate = true,
  enableControls = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const splatMeshRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const performanceRef = useRef<{ startTime: number; frameCount: number }>({
    startTime: performance.now(),
    frameCount: 0
  });

  const [modules, setModules] = useState<SparkJSModules | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Performance monitoring
  const logPerformance = useCallback(() => {
    const perf = performanceRef.current;
    const elapsed = performance.now() - perf.startTime;
    const fps = Math.round((perf.frameCount / elapsed) * 1000);
    
    if (perf.frameCount % 300 === 0) { // Log every 300 frames (~5 seconds at 60fps)
      console.log(`SparkJS Performance: ${fps} FPS, ${perf.frameCount} frames`);
    }
  }, []);

  // Load SparkJS modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        const loadedModules = await sparkJSLoader.loadModules();
        setModules(loadedModules);
      } catch (error) {
        setError(error.message);
      }
    };

    loadModules();
  }, []);

  // Initialize viewer when modules are loaded
  useEffect(() => {
    if (!modules || !mountRef.current) return;

    let mounted = true;

    const initializeViewer = async () => {
      try {
        const { THREE, SplatMesh, OrbitControls } = modules;
        
        // Create scene with optimized settings
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 0, 3);
        
        // Create renderer with maximum performance settings
        const renderer = new THREE.WebGLRenderer({ 
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false
        });
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Optimize renderer settings
        renderer.shadowMap.enabled = false;
        renderer.physicallyCorrectLights = false;
        renderer.toneMapping = THREE.NoToneMapping;
        
        // Check for low-end device optimizations
        const caps = sparkJSLoader.getCapabilities();
        if (caps.isLowEndDevice) {
          renderer.setPixelRatio(1);
          renderer.antialias = false;
        }
        
        // Clear existing content and add renderer
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(renderer.domElement);
        
        // Add optimized lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Store references
        sceneRef.current = scene;
        rendererRef.current = renderer;

        // Add controls if enabled
        if (enableControls) {
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = false;
          controls.screenSpacePanning = false;
          controls.minDistance = 0.5;
          controls.maxDistance = 20;
          controls.autoRotate = false;
          controlsRef.current = controls;
        }

        // Load 3D model or create default scene
        if (splatUrl && (splatUrl.includes('.ply') || splatUrl.includes('.splat'))) {
          try {
            let fileUrl = splatUrl;
            if (splatUrl.startsWith('/uploads/')) {
              const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
              fileUrl = `${BACKEND_URL}/api/homepage${splatUrl}`;
            }
            
            const splatMesh = new SplatMesh({ 
              url: fileUrl,
              alphaTest: 0.2,
              alphaHash: false,
              halfFloat: true,
              sphericalHarmonics: false,
              renderMode: 'basic',
              progressiveLoad: true,
              maxSplats: caps.isLowEndDevice ? 500000 : 1000000,
            });
            
            splatMesh.position.set(0, 0, 0);
            splatMesh.rotation.x = Math.PI;
            splatMesh.scale.set(1, 1, 1);
            
            scene.add(splatMesh);
            splatMeshRef.current = splatMesh;
            
          } catch (splatError) {
            console.error('Splat loading failed:', splatError);
            createDefaultScene(scene, THREE);
          }
        } else {
          createDefaultScene(scene, THREE);
        }

        // Optimized animation loop
        const animate = () => {
          if (!mounted) return;
          
          performanceRef.current.frameCount++;
          
          // Update controls
          if (controlsRef.current) {
            controlsRef.current.update();
          }
          
          // Auto-rotate splat model
          if (autoRotate && splatMeshRef.current) {
            splatMeshRef.current.rotation.y += 0.003;
          }
          
          // Animate default scene
          if (splatMeshRef.current && splatMeshRef.current.isGroup) {
            splatMeshRef.current.children.forEach((child: any, index: number) => {
              if (index > 1) {
                child.rotation.x += 0.005;
                child.rotation.y += 0.003;
              }
            });
          }
          
          renderer.render(scene, camera);
          animationIdRef.current = requestAnimationFrame(animate);
          
          // Log performance periodically
          if (performanceRef.current.frameCount % 60 === 0) {
            logPerformance();
          }
        };
        
        animate();
        setIsReady(true);

      } catch (err) {
        console.error('Error initializing optimized viewer:', err);
        setError(`Initialization failed: ${err.message}`);
      }
    };

    initializeViewer();

    return () => {
      mounted = false;
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [modules, splatUrl, width, height, autoRotate, enableControls, logPerformance]);

  // Create default scene helper
  const createDefaultScene = useCallback((scene: any, THREE: any) => {
    const group = new THREE.Group();
    group.isGroup = true;

    // Main sphere
    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);
    
    // Wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(0.82, 16, 16);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x60a5fa, 
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    group.add(wireframe);

    // Particles
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.6
    });

    const particleCount = sparkJSLoader.getCapabilities().isLowEndDevice ? 10 : 20;
    for (let i = 0; i < particleCount; i++) {
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
  }, []);

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

  return (
    <div 
      ref={mountRef} 
      className={`rounded-2xl overflow-hidden border-2 border-gray-700 ${className}`}
      style={{ width, height }}
    />
  );
};

export default OptimizedSplatViewer;