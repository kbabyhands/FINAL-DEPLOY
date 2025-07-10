// Optimized PlayCanvas viewer specifically for homepage
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pc from 'playcanvas';
import { usePlayCanvasPreloader } from '@/hooks/usePlayCanvasPreloader';

interface OptimizedPlayCanvasViewerProps {
  splatUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  autoRotate?: boolean;
  enableControls?: boolean;
  performanceMode?: boolean;
}

// Throttle function for event handling
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const OptimizedPlayCanvasViewer: React.FC<OptimizedPlayCanvasViewerProps> = ({ 
  splatUrl, 
  width = 800, 
  height = 400, 
  className = '',
  autoRotate = true,
  enableControls = true,
  performanceMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  const animationRef = useRef<number | null>(null);
  const modelEntityRef = useRef<pc.Entity | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const { getPreloadedModel, getInstance, returnInstance } = usePlayCanvasPreloader();

  // Performance monitoring
  const performanceRef = useRef<{ startTime: number; frameCount: number }>({
    startTime: performance.now(),
    frameCount: 0
  });

  const logPerformance = useCallback(() => {
    const perf = performanceRef.current;
    const elapsed = performance.now() - perf.startTime;
    const fps = Math.round((perf.frameCount / elapsed) * 1000);
    
    if (perf.frameCount % 300 === 0) { // Log every 300 frames (~5 seconds at 60fps)
      console.log(`PlayCanvas Performance: ${fps} FPS, ${perf.frameCount} frames`);
    }
  }, []);

  // Get or create PlayCanvas instance
  const getPlayCanvasInstance = useCallback((): pc.Application | null => {
    if (!canvasRef.current) return null;

    try {
      const app = new pc.Application(canvasRef.current, {
        mouse: new pc.Mouse(canvasRef.current),
        touch: new pc.TouchDevice(canvasRef.current),
        keyboard: new pc.Keyboard(window),
      });

      // Optimize canvas settings based on performance mode
      app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(performanceMode ? pc.RESOLUTION_FIXED : pc.RESOLUTION_AUTO);
      
      if (performanceMode) {
        app.graphicsDevice.canvas.width = Math.min(512, width);
        app.graphicsDevice.canvas.height = Math.min(512, height);
      } else {
        app.graphicsDevice.canvas.width = width;
        app.graphicsDevice.canvas.height = height;
      }
      
      app.resizeCanvas();
      return app;
    } catch (error) {
      console.error('OptimizedPlayCanvas: Failed to create instance:', error);
      return null;
    }
  }, [performanceMode, width, height]);

  // Throttled mouse handlers for smooth interaction
  const throttledMouseMove = useCallback(
    throttle((e: MouseEvent, handlers: any) => {
      if (!handlers.isDragging) return;
      
      const deltaX = e.clientX - handlers.lastMouseX;
      const deltaY = e.clientY - handlers.lastMouseY;
      
      handlers.orbitAngleX += deltaY * 0.01;
      handlers.orbitAngleY += deltaX * 0.01;
      
      handlers.orbitAngleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, handlers.orbitAngleX));
      
      const x = Math.sin(handlers.orbitAngleY) * Math.cos(handlers.orbitAngleX) * handlers.orbitDistance;
      const y = Math.sin(handlers.orbitAngleX) * handlers.orbitDistance;
      const z = Math.cos(handlers.orbitAngleY) * Math.cos(handlers.orbitAngleX) * handlers.orbitDistance;
      
      handlers.camera.setPosition(x, y, z);
      handlers.camera.lookAt(0, 0, 0);
      
      handlers.lastMouseX = e.clientX;
      handlers.lastMouseY = e.clientY;
    }, 16), // ~60fps
    []
  );

  // Main initialization effect
  useEffect(() => {
    if (!canvasRef.current) return;

    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    // Handle PlayCanvas URLs with iframe (same as original)
    if (splatUrl && splatUrl.includes('playcanv.as')) {
      console.log('OptimizedPlayCanvas: Detected PlayCanvas URL, embedding via iframe');
      
      const iframe = document.createElement('iframe');
      iframe.src = splatUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'eager';
      
      const canvas = canvasRef.current;
      if (canvas && canvas.parentNode) {
        canvas.style.display = 'none';
        canvas.parentNode.appendChild(iframe);
      }
      
      setLoading(false);
      setLoadingProgress(100);
      return () => {
        const iframes = canvas?.parentNode?.querySelectorAll('iframe');
        iframes?.forEach(iframe => iframe.remove());
      };
    }

    const app = getPlayCanvasInstance();
    if (!app) {
      setError('Failed to initialize 3D viewer');
      setLoading(false);
      return;
    }

    appRef.current = app;

    // Create camera entity with optimized settings
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.1),
      fov: 45,
      nearClip: 0.1,
      farClip: performanceMode ? 100 : 1000
    });
    camera.setPosition(0, 1, 5);
    camera.lookAt(0, 0, 0);
    app.root.addChild(camera);

    // Optimized lighting for performance
    const light = new pc.Entity('main-light');
    light.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(1, 1, 1),
      intensity: performanceMode ? 0.8 : 1
    });
    light.setEulerAngles(45, 30, 0);
    app.root.addChild(light);

    // Set ambient light with performance considerations
    app.scene.ambientLight = new pc.Color(
      performanceMode ? 0.3 : 0.2, 
      performanceMode ? 0.3 : 0.2, 
      performanceMode ? 0.4 : 0.3
    );

    // Mouse control state for interactive controls
    const controlState = {
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      orbitDistance: 5,
      orbitAngleX: 0,
      orbitAngleY: 0,
      camera
    };

    // Event handlers for controls
    const handleMouseDown = (e: MouseEvent) => {
      if (!enableControls) return;
      controlState.isDragging = true;
      controlState.lastMouseX = e.clientX;
      controlState.lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableControls) return;
      throttledMouseMove(e, controlState);
    };

    const handleMouseUp = () => {
      controlState.isDragging = false;
    };

    const handleWheel = throttle((e: WheelEvent) => {
      if (!enableControls) return;
      e.preventDefault();
      controlState.orbitDistance += e.deltaY * 0.01;
      controlState.orbitDistance = Math.max(1, Math.min(20, controlState.orbitDistance));
      
      const x = Math.sin(controlState.orbitAngleY) * Math.cos(controlState.orbitAngleX) * controlState.orbitDistance;
      const y = Math.sin(controlState.orbitAngleX) * controlState.orbitDistance;
      const z = Math.cos(controlState.orbitAngleY) * Math.cos(controlState.orbitAngleX) * controlState.orbitDistance;
      
      camera.setPosition(x, y, z);
      camera.lookAt(0, 0, 0);
    }, 16);

    // Add event listeners
    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Create immediate placeholder for instant feedback
    const createPlaceholder = () => {
      const material = new pc.StandardMaterial();
      material.diffuse = new pc.Color(0.3, 0.5, 0.8); // Blue theme to match homepage
      if (!performanceMode) {
        material.metalness = 0.3;
        material.gloss = 0.8;
      }
      material.update();

      const entity = new pc.Entity('homepage-placeholder');
      entity.addComponent('model', { type: 'sphere' }); // Use sphere for better homepage aesthetic
      
      if (entity.model?.meshInstances) {
        entity.model.meshInstances.forEach((meshInstance: any) => {
          meshInstance.material = material;
        });
      }
      
      app.root.addChild(entity);
      modelEntityRef.current = entity;
      
      return entity;
    };

    // Load model with enhanced preloader integration
    const loadModel = async () => {
      // Always show placeholder immediately for instant feedback
      const placeholder = createPlaceholder();
      setLoading(false); // Remove loading spinner immediately
      setLoadingProgress(50);
      
      if (!splatUrl?.trim()) {
        setLoadingProgress(100);
        return; // Keep placeholder for items without models
      }

      try {
        console.log(`OptimizedPlayCanvas: Loading model ${splatUrl}`);
        
        // Check preloader cache first - this should be instant if preloaded
        const preloadedAsset = getPreloadedModel(splatUrl);
        if (preloadedAsset) {
          console.log(`OptimizedPlayCanvas: Found preloaded model ${splatUrl}`);
          setLoadingProgress(80);
          
          // Remove placeholder
          placeholder.destroy();
          
          const modelEntity = new pc.Entity('preloaded-homepage-model');
          modelEntity.addComponent('model', { asset: preloadedAsset });
          app.root.addChild(modelEntity);
          modelEntityRef.current = modelEntity;
          setLoadingProgress(100);
          
          return;
        }

        // For homepage, we'll support common 3D formats
        const fileExtension = splatUrl.split('.').pop()?.toLowerCase();
        
        if (fileExtension === 'glb' || fileExtension === 'gltf') {
          setLoadingProgress(60);
          const asset = new pc.Asset('homepage-model', 'container', { url: splatUrl });

          asset.ready(() => {
            try {
              setLoadingProgress(90);
              
              // Remove placeholder
              placeholder.destroy();
              
              const modelEntity = new pc.Entity('loaded-homepage-model');
              modelEntity.addComponent('model', { asset });
              app.root.addChild(modelEntity);
              modelEntityRef.current = modelEntity;
              setLoadingProgress(100);
              
            } catch (error) {
              console.error('OptimizedPlayCanvas: Error creating model:', error);
              setError('Failed to create model');
            }
          });

          asset.on('error', (err: any) => {
            console.error('OptimizedPlayCanvas: Model loading error:', err);
            setError('Failed to load 3D model');
          });

          app.assets.add(asset);
          app.assets.load(asset);
        } else {
          // Keep placeholder for unsupported formats
          setLoadingProgress(100);
        }
      } catch (err) {
        console.error('OptimizedPlayCanvas: Error loading model:', err);
        setError('Failed to load 3D model');
      }
    };

    // Auto-rotation animation loop
    let rotationAngle = 0;
    const animate = () => {
      performanceRef.current.frameCount++;
      
      // Auto-rotate model if enabled
      if (autoRotate && modelEntityRef.current) {
        rotationAngle += 0.01; // Slow rotation for homepage
        modelEntityRef.current.setEulerAngles(0, rotationAngle * 57.2958, 0);
      }
      
      app.render();
      animationRef.current = requestAnimationFrame(animate);
      
      // Log performance periodically
      if (performanceRef.current.frameCount % 60 === 0) {
        logPerformance();
      }
    };

    // Initialize and start
    loadModel();
    app.start();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
      }
      
      if (appRef.current) {
        try {
          returnInstance(appRef.current);
        } catch (error) {
          console.warn('OptimizedPlayCanvas: Failed to return to pool, destroying:', error);
          appRef.current.destroy();
        }
        appRef.current = null;
      }
    };
  }, [splatUrl, width, height, autoRotate, enableControls, performanceMode, getPlayCanvasInstance, throttledMouseMove, getPreloadedModel, returnInstance, logPerformance]);

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
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden border-2 border-gray-700 ${className}`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading 3D Model...</p>
            {loadingProgress > 0 && (
              <div className="w-32 h-1 bg-gray-600 rounded-full mx-auto mt-2">
                <div 
                  className="h-1 bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {!loading && !error && enableControls && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {enableControls ? 'Drag to rotate • Scroll to zoom' : 'Auto-rotating'}
          {performanceMode && <span className="ml-2 text-yellow-300">⚡ Performance</span>}
        </div>
      )}
    </div>
  );
};

export default OptimizedPlayCanvasViewer;