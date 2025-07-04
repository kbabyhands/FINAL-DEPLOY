import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pc from 'playcanvas';

interface PlayCanvasViewerProps {
  splatUrl: string;
  className?: string;
  performanceMode?: boolean;
  lazyLoad?: boolean;
}

// Global instance pool for reusing PlayCanvas applications
const instancePool: pc.Application[] = [];
const modelCache = new Map<string, any>();

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

const PlayCanvasViewer = ({ 
  splatUrl, 
  className = "", 
  performanceMode = false,
  lazyLoad = true 
}: PlayCanvasViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  const animationRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isPaused, setIsPaused] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || !containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          } else if (!entry.isIntersecting && isVisible) {
            setIsPaused(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazyLoad, isVisible]);

  // Get or create PlayCanvas instance from pool
  const getPlayCanvasInstance = useCallback((): pc.Application | null => {
    if (!canvasRef.current) return null;

    // Create new instance since PlayCanvas doesn't support canvas switching
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
        app.graphicsDevice.canvas.width = 512;
        app.graphicsDevice.canvas.height = 512;
      }
      app.resizeCanvas();

      return app;
    } catch (error) {
      console.error('PlayCanvasViewer: Failed to create PlayCanvas instance:', error);
      return null;
    }
  }, [performanceMode]);

  // Simplified cleanup - just destroy the app
  const cleanupInstance = useCallback((app: pc.Application) => {
    app.destroy();
  }, []);

  // Throttled mouse handlers
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
    if (!isVisible || !canvasRef.current) return;

    setLoading(true);
    setError(null);

    // Handle PlayCanvas URLs with iframe
    if (splatUrl && splatUrl.includes('playcanv.as')) {
      console.log('PlayCanvasViewer: Detected PlayCanvas URL, embedding via iframe');
      
      const iframe = document.createElement('iframe');
      iframe.src = splatUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'lazy';
      
      const canvas = canvasRef.current;
      if (canvas && canvas.parentNode) {
        canvas.style.display = 'none';
        canvas.parentNode.appendChild(iframe);
      }
      
      setLoading(false);
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

    // Create camera entity
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

    // Simplified lighting for performance
    const light = new pc.Entity('main-light');
    light.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(1, 1, 1),
      intensity: performanceMode ? 0.8 : 1
    });
    light.setEulerAngles(45, 30, 0);
    app.root.addChild(light);

    // Set ambient light
    app.scene.ambientLight = new pc.Color(
      performanceMode ? 0.3 : 0.2, 
      performanceMode ? 0.3 : 0.2, 
      performanceMode ? 0.4 : 0.3
    );

    // Mouse control state
    const controlState = {
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      orbitDistance: 5,
      orbitAngleX: 0,
      orbitAngleY: 0,
      camera
    };

    const handleMouseDown = (e: MouseEvent) => {
      controlState.isDragging = true;
      controlState.lastMouseX = e.clientX;
      controlState.lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      throttledMouseMove(e, controlState);
    };

    const handleMouseUp = () => {
      controlState.isDragging = false;
    };

    const handleWheel = throttle((e: WheelEvent) => {
      e.preventDefault();
      controlState.orbitDistance += e.deltaY * 0.01;
      controlState.orbitDistance = Math.max(1, Math.min(20, controlState.orbitDistance));
      
      const x = Math.sin(controlState.orbitAngleY) * Math.cos(controlState.orbitAngleX) * controlState.orbitDistance;
      const y = Math.sin(controlState.orbitAngleX) * controlState.orbitDistance;
      const z = Math.cos(controlState.orbitAngleY) * Math.cos(controlState.orbitAngleX) * controlState.orbitDistance;
      
      camera.setPosition(x, y, z);
      camera.lookAt(0, 0, 0);
    }, 16);

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Load model with caching
    const loadModel = async () => {
      if (!splatUrl?.trim()) {
        // Create optimized placeholder
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0.5, 0.5, 0.5);
        material.update();

        const entity = new pc.Entity('placeholder');
        entity.addComponent('model', { type: 'box' });
        
        if (entity.model?.meshInstances) {
          entity.model.meshInstances.forEach((meshInstance: any) => {
            meshInstance.material = material;
          });
        }
        
        app.root.addChild(entity);
        setLoading(false);
        return;
      }

      try {
        // Check cache first
        if (modelCache.has(splatUrl)) {
          const cachedAsset = modelCache.get(splatUrl);
          const modelEntity = new pc.Entity('cached-model');
          modelEntity.addComponent('model', { asset: cachedAsset });
          app.root.addChild(modelEntity);
          setLoading(false);
          return;
        }

        const fileExtension = splatUrl.split('.').pop()?.toLowerCase();
        
        if (fileExtension === 'glb' || fileExtension === 'gltf') {
          const asset = new pc.Asset('model', 'container', { url: splatUrl });

          asset.ready(() => {
            try {
              // Cache the asset
              modelCache.set(splatUrl, asset);
              
              const modelEntity = new pc.Entity('loaded-model');
              modelEntity.addComponent('model', { asset });
              app.root.addChild(modelEntity);
              setLoading(false);
              
              // Optional animation (disabled in performance mode)
              if (!performanceMode) {
                let angle = 0;
                const updateHandler = (dt: number) => {
                  if (!isPaused) {
                    angle += dt * 0.2;
                    modelEntity.setEulerAngles(0, angle * 57.2958, 0);
                  }
                };
                app.on('update', updateHandler);
              }
            } catch (error) {
              console.error('PlayCanvasViewer: Error creating model:', error);
              setError('Failed to create model');
              setLoading(false);
            }
          });

          asset.on('error', (err: any) => {
            console.error('PlayCanvasViewer: Model loading error:', err);
            setError('Failed to load 3D model');
            setLoading(false);
          });

          app.assets.add(asset);
          app.assets.load(asset);
        } else {
          // Optimized placeholder for unsupported formats
          const material = new pc.StandardMaterial();
          material.diffuse = new pc.Color(0.7, 0.5, 0.8);
          if (!performanceMode) {
            material.metalness = 0.3;
            material.gloss = 0.8;
          }
          material.update();

          const entity = new pc.Entity('placeholder');
          entity.addComponent('model', { type: 'box' });
          
          if (entity.model?.meshInstances) {
            entity.model.meshInstances.forEach((meshInstance: any) => {
              meshInstance.material = material;
            });
          }
          
          app.root.addChild(entity);
          setLoading(false);
          
          // Optional animation
          if (!performanceMode) {
            let angle = 0;
            app.on('update', (dt: number) => {
              if (!isPaused) {
                angle += dt;
                entity.setEulerAngles(angle * 15, angle * 30, 0);
              }
            });
          }
        }
      } catch (err) {
        console.error('PlayCanvasViewer: Error loading model:', err);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    };

    loadModel();
    app.start();

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
      }
      
      if (appRef.current) {
        cleanupInstance(appRef.current);
        appRef.current = null;
      }
    };
  }, [isVisible, splatUrl, performanceMode, isPaused, getPlayCanvasInstance, cleanupInstance, throttledMouseMove]);

  // Pause/resume based on visibility
  useEffect(() => {
    if (appRef.current) {
      if (isPaused) {
        appRef.current.timeScale = 0;
      } else {
        appRef.current.timeScale = 1;
      }
    }
  }, [isPaused]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ display: 'block' }}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              {lazyLoad && !isVisible ? 'Preparing 3D viewer...' : 'Loading 3D model...'}
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <p className="text-xs text-gray-500">Please check the model file format</p>
          </div>
        </div>
      )}
      
      {!loading && !error && splatUrl && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Drag to rotate • Scroll to zoom
          {performanceMode && <span className="ml-2 text-yellow-300">⚡ Performance Mode</span>}
          {isPaused && <span className="ml-2 text-orange-300">⏸ Paused</span>}
        </div>
      )}
    </div>
  );
};

export default PlayCanvasViewer;