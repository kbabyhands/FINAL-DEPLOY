import React, { useEffect, useRef } from 'react';
import * as pc from 'playcanvas';

interface PlayCanvasViewerProps {
  splatUrl: string;
  className?: string;
}

const PlayCanvasViewer = ({ splatUrl, className = "" }: PlayCanvasViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

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

    // Create camera entity with orbit camera script
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.1)
    });
    camera.setPosition(0, 0, 3);

    // Add orbit camera for interactive controls
    camera.addComponent('script');
    app.root.addChild(camera);

    // Create directional light entity
    const light = new pc.Entity('light');
    light.addComponent('light');
    light.setEulerAngles(45, 0, 0);
    app.root.addChild(light);

    // Load Gaussian splat asset
    if (splatUrl) {
      // Create a simple sphere as placeholder for now
      // In a real implementation, you would load the Gaussian splat data
      const material = new pc.StandardMaterial();
      material.diffuse = new pc.Color(0.7, 0.7, 0.7);
      material.update();

      const sphere = new pc.Entity('sphere');
      sphere.addComponent('render', {
        type: 'sphere',
        material: material
      });
      app.root.addChild(sphere);

      // Add rotation animation
      let angle = 0;
      app.on('update', (dt: number) => {
        angle += dt;
        sphere.setEulerAngles(0, angle * 30, 0);
      });
    }

    // Start the application
    app.start();

    return () => {
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, [splatUrl]);

  return (
    <div className={`w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default PlayCanvasViewer;