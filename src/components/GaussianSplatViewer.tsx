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
  const [splatData, setSplatData] = useState<Float32Array | null>(null);
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
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    loadGaussianSplat();
  }, [isOpen, splatUrl]);

  const loadGaussianSplat = async () => {
    console.log('Starting to load Gaussian splat from:', splatUrl);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch the splat file
      const response = await fetch(splatUrl);
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch splat file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('Loaded splat file, size:', arrayBuffer.byteLength, 'bytes');

      if (arrayBuffer.byteLength === 0) {
        throw new Error('File is empty');
      }

      // Parse the splat data
      console.log('Starting to parse splat data...');
      const parsedData = await parseSplatData(arrayBuffer);
      console.log('Parsed data points:', parsedData.length / 6);
      
      if (parsedData.length === 0) {
        throw new Error('No valid data points found in the file');
      }
      
      setSplatData(parsedData);
      
      // Render the splat data
      console.log('Starting to render...');
      renderGaussianSplat(parsedData);
      console.log('Rendering complete');
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading Gaussian splat:', err);
      setError(err.message || 'Failed to load Gaussian splat file');
      setIsLoading(false);
    }
  };

  const parseSplatData = async (buffer: ArrayBuffer): Promise<Float32Array> => {
    const uint8Array = new Uint8Array(buffer);
    
    // Check if it's a PLY file
    const headerSample = new TextDecoder().decode(uint8Array.slice(0, 100));
    console.log('File header sample:', headerSample.substring(0, 50));
    
    if (headerSample.toLowerCase().includes('ply')) {
      console.log('Detected PLY file format');
      return parsePLYFile(buffer);
    } else {
      console.log('Assuming binary splat file format');
      return parseBinarySplatFile(buffer);
    }
  };

  const parsePLYFile = (buffer: ArrayBuffer): Float32Array => {
    console.log('Parsing PLY file...');
    const text = new TextDecoder().decode(buffer);
    const lines = text.split('\n');
    
    let vertexCount = 0;
    let headerEnd = 0;
    
    // Parse header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('element vertex')) {
        vertexCount = parseInt(line.split(' ')[2]);
        console.log('Found vertex count in PLY:', vertexCount);
      }
      if (line === 'end_header') {
        headerEnd = i + 1;
        console.log('Header ends at line:', headerEnd);
        break;
      }
    }
    
    if (vertexCount === 0) {
      throw new Error('Invalid PLY file: no vertices found in header');
    }
    
    // Parse vertex data
    const points = new Float32Array(vertexCount * 6); // x, y, z, r, g, b
    let validPoints = 0;
    
    for (let i = 0; i < vertexCount && (headerEnd + i) < lines.length; i++) {
      const line = lines[headerEnd + i].trim();
      if (!line) continue;
      
      const values = line.split(/\s+/).map(v => parseFloat(v));
      if (values.length >= 3 && !values.slice(0, 3).some(isNaN)) {
        const baseIndex = validPoints * 6;
        points[baseIndex] = values[0];     // x
        points[baseIndex + 1] = values[1]; // y
        points[baseIndex + 2] = values[2]; // z
        
        // Handle colors (normalize if needed)
        points[baseIndex + 3] = values.length > 3 ? (values[3] > 1 ? values[3] / 255 : values[3]) : Math.random();
        points[baseIndex + 4] = values.length > 4 ? (values[4] > 1 ? values[4] / 255 : values[4]) : Math.random();
        points[baseIndex + 5] = values.length > 5 ? (values[5] > 1 ? values[5] / 255 : values[5]) : Math.random();
        
        validPoints++;
      }
    }
    
    console.log('Successfully parsed', validPoints, 'valid points from PLY');
    
    if (validPoints === 0) {
      throw new Error('No valid vertex data found in PLY file');
    }
    
    // Return only the valid portion of the array
    return points.slice(0, validPoints * 6);
  };

  const parseBinarySplatFile = (buffer: ArrayBuffer): Float32Array => {
    console.log('Parsing binary splat file...');
    
    // Try different point sizes
    const possiblePointSizes = [32, 24, 16, 12];
    let bestData: Float32Array | null = null;
    let maxValidPoints = 0;
    
    for (const pointSize of possiblePointSizes) {
      const pointCount = Math.floor(buffer.byteLength / pointSize);
      console.log(`Trying point size ${pointSize}, estimated ${pointCount} points`);
      
      if (pointCount === 0) continue;
      
      const points = new Float32Array(pointCount * 6);
      const dataView = new DataView(buffer);
      let validPoints = 0;
      
      for (let i = 0; i < pointCount; i++) {
        const offset = i * pointSize;
        const pointIndex = validPoints * 6;
        
        try {
          const x = dataView.getFloat32(offset, true);
          const y = dataView.getFloat32(offset + 4, true);
          const z = dataView.getFloat32(offset + 8, true);
          
          // Check if coordinates are reasonable (not NaN, not extremely large)
          if (!isNaN(x) && !isNaN(y) && !isNaN(z) && 
              Math.abs(x) < 1000 && Math.abs(y) < 1000 && Math.abs(z) < 1000) {
            
            points[pointIndex] = x;
            points[pointIndex + 1] = y;
            points[pointIndex + 2] = z;
            points[pointIndex + 3] = Math.random(); // r
            points[pointIndex + 4] = Math.random(); // g
            points[pointIndex + 5] = Math.random(); // b
            validPoints++;
          }
        } catch (e) {
          // Skip invalid points
          continue;
        }
      }
      
      console.log(`Point size ${pointSize}: ${validPoints} valid points`);
      
      if (validPoints > maxValidPoints) {
        maxValidPoints = validPoints;
        bestData = points.slice(0, validPoints * 6);
      }
    }
    
    if (!bestData || maxValidPoints === 0) {
      throw new Error('Unable to parse binary data - no valid points found');
    }
    
    console.log('Best parsing result:', maxValidPoints, 'valid points');
    return bestData;
  };

  const renderGaussianSplat = (data: Float32Array) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !data) {
      console.error('Canvas or context not available for rendering');
      return;
    }

    console.log('Starting render with canvas size:', canvas.width, 'x', canvas.height);

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pointCount = data.length / 6;
    
    console.log('Rendering', pointCount, 'points to canvas');

    let renderedCount = 0;

    // Render points
    for (let i = 0; i < pointCount; i++) {
      const baseIndex = i * 6;
      
      const x = data[baseIndex];
      const y = data[baseIndex + 1];
      const z = data[baseIndex + 2];
      const r = data[baseIndex + 3];
      const g = data[baseIndex + 4];
      const b = data[baseIndex + 5];
      
      // Apply camera transformations
      const rotatedX = Math.cos(camera.rotationY) * x - Math.sin(camera.rotationY) * z;
      const rotatedZ = Math.sin(camera.rotationY) * x + Math.cos(camera.rotationY) * z;
      const rotatedY = Math.cos(camera.rotationX) * y - Math.sin(camera.rotationX) * rotatedZ;
      
      // Project 3D to 2D
      const scale = (5 + rotatedZ) * camera.zoom * 50;
      const screenX = centerX + rotatedX * scale;
      const screenY = centerY - rotatedY * scale;
      
      // Skip points outside canvas
      if (screenX < -10 || screenX > canvas.width + 10 || screenY < -10 || screenY > canvas.height + 10) {
        continue;
      }
      
      // Calculate point size based on distance
      const depth = Math.max(0.1, 5 + rotatedZ);
      const pointSize = Math.max(1, (3 * camera.zoom) / depth);
      
      // Set color
      const red = Math.floor(Math.max(0, Math.min(255, r * 255)));
      const green = Math.floor(Math.max(0, Math.min(255, g * 255)));
      const blue = Math.floor(Math.max(0, Math.min(255, b * 255)));
      
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, pointSize, 0, Math.PI * 2);
      ctx.fill();
      
      renderedCount++;
    }

    console.log('Rendered', renderedCount, 'points to screen');

    // Add UI overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '16px Arial';
    ctx.fillText(`Gaussian Splat: ${pointCount} points (${renderedCount} visible)`, 20, 30);
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
    if (splatData) {
      renderGaussianSplat(splatData);
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
    if (splatData) {
      renderGaussianSplat(splatData);
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

    if (splatData) {
      renderGaussianSplat(splatData);
    }
  };

  const zoomIn = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.min(3, prev.zoom * 1.2)
    }));

    if (splatData) {
      renderGaussianSplat(splatData);
    }
  };

  const zoomOut = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1, prev.zoom * 0.8)
    }));

    if (splatData) {
      renderGaussianSplat(splatData);
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
          <div className="h-[500px] w-full bg-gray-900 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading 3D model...</p>
                  <p className="text-sm text-gray-400 mt-2">Processing Gaussian splat data...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-red-400 text-center max-w-md p-4">
                  <p className="text-lg mb-2">⚠️ Error Loading 3D Model</p>
                  <p className="text-sm mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadGaussianSplat}
                    className="text-white border-white hover:bg-white hover:text-black"
                  >
                    Try Again
                  </Button>
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
            Interactive 3D view of the Gaussian splat model. Drag to rotate and scroll to zoom for a better perspective.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GaussianSplatViewer;
