
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';

interface GaussianSplatViewerProps {
  isOpen: boolean;
  onClose: () => void;
  splatUrl: string;
  itemTitle: string;
}

const GaussianSplatViewer = ({ isOpen, onClose, splatUrl, itemTitle }: GaussianSplatViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    z: 5,
    rotationX: 0,
    rotationY: 0,
    zoom: 1
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Load and render Gaussian splat
    loadGaussianSplat();
  }, [isOpen, splatUrl]);

  const loadGaussianSplat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll create a placeholder visualization
      // In a real implementation, you'd load and parse the actual splat file
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      if (!canvas || !ctx) return;

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a placeholder 3D-like visualization
      renderSplatVisualization(ctx, canvas.width, canvas.height);
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load Gaussian splat file');
      setIsLoading(false);
    }
  };

  const renderSplatVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Create a 3D-like point cloud visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const numPoints = 5000;

    for (let i = 0; i < numPoints; i++) {
      // Generate pseudo-3D points
      const angle1 = (Math.PI * 2 * i) / numPoints;
      const angle2 = Math.sin(i * 0.01) + camera.rotationY;
      const radius = 100 + Math.sin(i * 0.02) * 50;
      
      const x = centerX + Math.cos(angle1) * radius * Math.cos(angle2) * camera.zoom;
      const y = centerY + Math.sin(angle1) * radius * Math.sin(camera.rotationX) * camera.zoom;
      const z = Math.sin(angle2) * radius;
      
      // Color based on depth
      const depth = (z + 150) / 300;
      const red = Math.floor(255 * Math.max(0, depth));
      const green = Math.floor(255 * Math.max(0, 1 - Math.abs(depth - 0.5) * 2));
      const blue = Math.floor(255 * Math.max(0, 1 - depth));
      
      // Size based on depth
      const size = Math.max(1, 3 * depth * camera.zoom);
      
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add some UI indicators
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px Arial';
    ctx.fillText('Gaussian Splat Visualization', 20, 30);
    ctx.font = '12px Arial';
    ctx.fillText('Drag to rotate • Scroll to zoom', 20, 50);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setCamera(prev => ({
      ...prev,
      rotationY: prev.rotationY + deltaX * 0.01,
      rotationX: prev.rotationX + deltaY * 0.01
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
    
    // Re-render with new camera position
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      renderSplatVisualization(ctx, canvas.width, canvas.height);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom * zoomDelta))
    }));

    // Re-render with new zoom
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      renderSplatVisualization(ctx, canvas.width, canvas.height);
    }
  };

  const resetView = () => {
    setCamera({
      x: 0,
      y: 0,
      z: 5,
      rotationX: 0,
      rotationY: 0,
      zoom: 1
    });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      renderSplatVisualization(ctx, canvas.width, canvas.height);
    }
  };

  const zoomIn = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.min(3, prev.zoom * 1.2)
    }));

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      renderSplatVisualization(ctx, canvas.width, canvas.height);
    }
  };

  const zoomOut = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1, prev.zoom * 0.8)
    }));

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      renderSplatVisualization(ctx, canvas.width, canvas.height);
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
          {/* Canvas for Gaussian Splat */}
          <div className="h-[500px] w-full bg-gray-900 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading 3D dish view...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-red-400 text-center">
                  <p className="text-lg mb-2">⚠️ Error Loading</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ display: isLoading || error ? 'none' : 'block' }}
            />
          </div>
          
          {/* Control buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              className="bg-white/90 hover:bg-white"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomIn}
              className="bg-white/90 hover:bg-white"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomOut}
              className="bg-white/90 hover:bg-white"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
            <p className="flex items-center gap-2">
              <Move3D className="w-4 h-4" />
              Drag to rotate • Scroll to zoom
            </p>
          </div>
        </div>
        
        <div className="p-6 pt-4">
          <p className="text-gray-600 text-sm text-center">
            Interactive 3D view of the dish. Drag to rotate and scroll to zoom for a better perspective.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GaussianSplatViewer;
