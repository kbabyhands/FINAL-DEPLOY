import React, { useEffect, useRef, useState } from 'react';
import * as pc from 'playcanvas';

interface PlayCanvasViewerProps {
  splatUrl: string;
  className?: string;
}

const PlayCanvasViewer = ({ splatUrl, className = "" }: PlayCanvasViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    setLoading(true);
    setError(null);

    // Create PlayCanvas application
    const app = new pc.Application(canvasRef.current, {
      mouse: new pc.Mouse(canvasRef.current),
      touch: new pc.TouchDevice(canvasRef.current),
      keyboard: new pc.Keyboard(window),
    });

    appRef.current = app;

    // Fill the available space
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    // Resize the canvas to fit the container
    app.resizeCanvas();

    // Create camera entity
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.1),
      fov: 45,
      nearClip: 0.1,
      farClip: 1000
    });
    camera.setPosition(0, 1, 5);
    camera.lookAt(0, 0, 0);
    app.root.addChild(camera);

    // Add orbit camera controls
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let orbitDistance = 5;
    let orbitAngleX = 0;
    let orbitAngleY = 0;

    const canvas = canvasRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      
      orbitAngleX += deltaY * 0.01;
      orbitAngleY += deltaX * 0.01;
      
      orbitAngleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, orbitAngleX));
      
      const x = Math.sin(orbitAngleY) * Math.cos(orbitAngleX) * orbitDistance;
      const y = Math.sin(orbitAngleX) * orbitDistance;
      const z = Math.cos(orbitAngleY) * Math.cos(orbitAngleX) * orbitDistance;
      
      camera.setPosition(x, y, z);
      camera.lookAt(0, 0, 0);
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitDistance += e.deltaY * 0.01;
      orbitDistance = Math.max(1, Math.min(20, orbitDistance));
      
      const x = Math.sin(orbitAngleY) * Math.cos(orbitAngleX) * orbitDistance;
      const y = Math.sin(orbitAngleX) * orbitDistance;
      const z = Math.cos(orbitAngleY) * Math.cos(orbitAngleX) * orbitDistance;
      
      camera.setPosition(x, y, z);
      camera.lookAt(0, 0, 0);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Create lighting
    const light1 = new pc.Entity('light1');
    light1.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(1, 1, 1),
      intensity: 1
    });
    light1.setEulerAngles(45, 30, 0);
    app.root.addChild(light1);

    const light2 = new pc.Entity('light2');
    light2.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(0.5, 0.7, 1),
      intensity: 0.5
    });
    light2.setEulerAngles(-45, -30, 0);
    app.root.addChild(light2);

    // Set ambient light via scene settings
    app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.3);

    // Load 3D model
    console.log('PlayCanvasViewer: Loading model from URL:', splatUrl);
    
    if (splatUrl && splatUrl.trim()) {
      const loadModel = async () => {
        try {
          console.log('PlayCanvasViewer: Starting model load...');
          
          // Check if it's a PlayCanvas URL
          if (splatUrl.includes('playcanv.as')) {
            console.log('PlayCanvasViewer: Detected PlayCanvas URL, creating placeholder');
            // For PlayCanvas URLs, we'll create a placeholder since we can't directly embed them
            const material = new pc.StandardMaterial();
            material.diffuse = new pc.Color(0.2, 0.6, 1.0);
            material.metalness = 0.1;
            material.gloss = 0.9;
            material.update();

            const entity = new pc.Entity('playcanvas-placeholder');
            entity.addComponent('render', {
              type: 'sphere',
              material: material
            });
            
            app.root.addChild(entity);
            setLoading(false);
            
            // Add rotation animation
            let angle = 0;
            app.on('update', (dt: number) => {
              angle += dt * 0.5;
              entity.setEulerAngles(0, angle * 57.2958, 0);
            });
            return;
          }
          
          const fileExtension = splatUrl.split('.').pop()?.toLowerCase();
          console.log('PlayCanvasViewer: File extension:', fileExtension);
          
          if (fileExtension === 'glb' || fileExtension === 'gltf') {
            console.log('PlayCanvasViewer: Loading GLB/GLTF model');
            
            // Create asset for the model
            const asset = new pc.Asset('model', 'container', {
              url: splatUrl
            });

            asset.ready(() => {
              console.log('PlayCanvasViewer: Model asset ready');
              try {
                // Create entity and add model component
                const modelEntity = new pc.Entity('loaded-model');
                modelEntity.addComponent('model', {
                  asset: asset
                });
                
                app.root.addChild(modelEntity);
                setLoading(false);
                console.log('PlayCanvasViewer: Model successfully added to scene');
                
                // Add subtle rotation animation
                let angle = 0;
                app.on('update', (dt: number) => {
                  angle += dt * 0.2;
                  modelEntity.setEulerAngles(0, angle * 57.2958, 0);
                });
              } catch (instantiateError) {
                console.error('PlayCanvasViewer: Error creating model:', instantiateError);
                setError('Failed to create model from loaded data');
                setLoading(false);
              }
            });

            asset.on('error', (err: any) => {
              console.error('PlayCanvasViewer: Model loading error:', err);
              setError('Failed to load 3D model file');
              setLoading(false);
            });

            console.log('PlayCanvasViewer: Adding and loading asset...');
            app.assets.add(asset);
            app.assets.load(asset);
          } else {
            console.log('PlayCanvasViewer: Creating placeholder for unsupported format');
            // Fallback for other formats or create a placeholder
            const material = new pc.StandardMaterial();
            material.diffuse = new pc.Color(0.7, 0.5, 0.8);
            material.metalness = 0.3;
            material.gloss = 0.8;
            material.update();

            const entity = new pc.Entity('placeholder');
            entity.addComponent('render', {
              type: 'box',
              material: material
            });
            
            app.root.addChild(entity);
            setLoading(false);
            
            // Add rotation animation
            let angle = 0;
            app.on('update', (dt: number) => {
              angle += dt;
              entity.setEulerAngles(angle * 15, angle * 30, 0);
            });
          }
        } catch (err) {
          console.error('PlayCanvasViewer: Error in loadModel:', err);
          setError('Failed to load 3D model');
          setLoading(false);
        }
      };

      loadModel();
    } else {
      console.log('PlayCanvasViewer: No URL provided, showing placeholder');
      // Create a default placeholder when no URL is provided
      const material = new pc.StandardMaterial();
      material.diffuse = new pc.Color(0.5, 0.5, 0.5);
      material.update();

      const entity = new pc.Entity('default-placeholder');
      entity.addComponent('render', {
        type: 'box',
        material: material
      });
      
      app.root.addChild(entity);
      setLoading(false);
    }

    // Start the application
    app.start();

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
      }
      
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, [splatUrl]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ display: 'block' }}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading 3D model...</p>
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
        </div>
      )}
    </div>
  );
};

export default PlayCanvasViewer;