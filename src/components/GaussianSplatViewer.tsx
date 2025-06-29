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
    console.log('Starting to load file from:', splatUrl);
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(splatUrl);
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('Loaded file, size:', arrayBuffer.byteLength, 'bytes');

      if (arrayBuffer.byteLength === 0) {
        throw new Error('File is empty');
      }

      // Try to parse the data
      const parsedData = await parseFileData(arrayBuffer);
      console.log('Parsed data points:', parsedData.length / 6);
      
      if (parsedData.length === 0) {
        throw new Error('No valid point data found in the file');
      }
      
      setSplatData(parsedData);
      renderPointCloud(parsedData);
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('Error loading file:', err);
      setError(err.message || 'Failed to load 3D model file');
      setIsLoading(false);
    }
  };

  const parseFileData = async (buffer: ArrayBuffer): Promise<Float32Array> => {
    const uint8Array = new Uint8Array(buffer);
    
    // Check if it's a ZIP file (starts with PK)
    if (uint8Array.length >= 4 && uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) {
      console.log('Detected ZIP file, attempting to extract...');
      try {
        return await extractFromZip(buffer);
      } catch (zipError) {
        console.error('ZIP extraction failed:', zipError);
        throw new Error('Failed to extract PLY file from ZIP archive. Please upload an uncompressed PLY file instead.');
      }
    }
    
    // Check if it's a PLY file
    const textSample = new TextDecoder().decode(uint8Array.slice(0, 200));
    console.log('File starts with:', textSample.substring(0, 50));
    
    if (textSample.toLowerCase().includes('ply')) {
      console.log('Detected PLY file format');
      return parsePLYFile(buffer);
    }
    
    // If not PLY or ZIP, assume it's binary point cloud data
    console.log('Attempting to parse as binary point cloud...');
    return parseBinaryPointCloud(buffer);
  };

  const extractFromZip = async (buffer: ArrayBuffer): Promise<Float32Array> => {
    // Simple ZIP extraction - look for the first PLY file
    const uint8Array = new Uint8Array(buffer);
    const dataView = new DataView(buffer);
    
    // Look for local file header signature (0x504B0304)
    for (let i = 0; i < uint8Array.length - 30; i++) {
      const signature = dataView.getUint32(i, true);
      
      if (signature === 0x04034b50) { // Local file header
        const compressionMethod = dataView.getUint16(i + 8, true);
        const compressedSize = dataView.getUint32(i + 18, true);
        const uncompressedSize = dataView.getUint32(i + 22, true);
        const fileNameLength = dataView.getUint16(i + 26, true);
        const extraFieldLength = dataView.getUint16(i + 28, true);
        
        const fileNameStart = i + 30;
        const fileName = new TextDecoder().decode(uint8Array.slice(fileNameStart, fileNameStart + fileNameLength));
        
        console.log('Found file:', fileName, 'compression:', compressionMethod);
        
        if (fileName.toLowerCase().endsWith('.ply')) {
          const dataStart = fileNameStart + fileNameLength + extraFieldLength;
          
          if (compressionMethod === 0) { // No compression
            const fileData = uint8Array.slice(dataStart, dataStart + compressedSize);
            console.log('Extracted uncompressed PLY file:', fileName);
            return parsePLYFile(fileData.buffer);
          } else {
            throw new Error('Compressed ZIP files are not supported. Please upload an uncompressed ZIP or raw PLY file.');
          }
        }
      }
    }
    
    throw new Error('No PLY files found in ZIP archive');
  };

  const parsePLYFile = (buffer: ArrayBuffer): Float32Array => {
    console.log('Parsing PLY file...');
    const text = new TextDecoder().decode(buffer);
    const lines = text.split('\n');
    
    let vertexCount = 0;
    let headerEnd = 0;
    let hasColors = false;
    
    // Parse header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (line.startsWith('element vertex')) {
        vertexCount = parseInt(line.split(' ')[2]);
        console.log('Vertex count:', vertexCount);
      }
      
      if (line.includes('property') && (line.includes('red') || line.includes('green') || line.includes('blue'))) {
        hasColors = true;
      }
      
      if (line === 'end_header') {
        headerEnd = i + 1;
        break;
      }
    }
    
    if (vertexCount === 0) {
      throw new Error('Invalid PLY file: no vertices found');
    }
    
    console.log('PLY info - vertices:', vertexCount, 'has colors:', hasColors);
    
    // Parse vertex data
    const points = new Float32Array(vertexCount * 6); // x, y, z, r, g, b
    let validPoints = 0;
    
    for (let i = 0; i < vertexCount && (headerEnd + i) < lines.length; i++) {
      const line = lines[headerEnd + i].trim();
      if (!line) continue;
      
      const values = line.split(/\s+/).map(parseFloat);
      
      if (values.length >= 3 && !values.slice(0, 3).some(isNaN)) {
        const idx = validPoints * 6;
        
        // Position
        points[idx] = values[0];
        points[idx + 1] = values[1];
        points[idx + 2] = values[2];
        
        // Colors
        if (hasColors && values.length >= 6) {
          // Normalize colors if they're in 0-255 range
          points[idx + 3] = values[3] > 1 ? values[3] / 255 : values[3];
          points[idx + 4] = values[4] > 1 ? values[4] / 255 : values[4];
          points[idx + 5] = values[5] > 1 ? values[5] / 255 : values[5];
        } else {
          // Generate colors based on position
          points[idx + 3] = Math.abs(values[0]) / 10 % 1;
          points[idx + 4] = Math.abs(values[1]) / 10 % 1;
          points[idx + 5] = Math.abs(values[2]) / 10 % 1;
        }
        
        validPoints++;
      }
    }
    
    console.log('Successfully parsed', validPoints, 'points from PLY');
    
    if (validPoints === 0) {
      throw new Error('No valid vertex data found in PLY file');
    }
    
    return points.slice(0, validPoints * 6);
  };

  const parseBinaryPointCloud = (buffer: ArrayBuffer): Float32Array => {
    console.log('Parsing as binary point cloud...');
    
    // Try different point sizes to find the best match
    const pointSizes = [32, 24, 16, 12];
    let bestResult: Float32Array | null = null;
    let maxValidPoints = 0;
    
    for (const pointSize of pointSizes) {
      const pointCount = Math.floor(buffer.byteLength / pointSize);
      if (pointCount === 0) continue;
      
      const dataView = new DataView(buffer);
      const points = new Float32Array(pointCount * 6);
      let validPoints = 0;
      
      for (let i = 0; i < pointCount; i++) {
        const offset = i * pointSize;
        
        try {
          const x = dataView.getFloat32(offset, true);
          const y = dataView.getFloat32(offset + 4, true);
          const z = dataView.getFloat32(offset + 8, true);
          
          // Check if coordinates are reasonable
          if (!isNaN(x) && !isNaN(y) && !isNaN(z) && 
              Math.abs(x) < 100 && Math.abs(y) < 100 && Math.abs(z) < 100) {
            
            const idx = validPoints * 6;
            points[idx] = x;
            points[idx + 1] = y;
            points[idx + 2] = z;
            points[idx + 3] = Math.random();
            points[idx + 4] = Math.random();
            points[idx + 5] = Math.random();
            validPoints++;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (validPoints > maxValidPoints) {
        maxValidPoints = validPoints;
        bestResult = points.slice(0, validPoints * 6);
      }
    }
    
    if (!bestResult || maxValidPoints === 0) {
      throw new Error('Unable to parse file as point cloud data');
    }
    
    console.log('Parsed', maxValidPoints, 'points from binary data');
    return bestResult;
  };

  const renderPointCloud = (data: Float32Array) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !data) return;

    console.log('Rendering', data.length / 6, 'points');

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pointCount = data.length / 6;

    // Find bounds for better centering
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < pointCount; i++) {
      const x = data[i * 6];
      const y = data[i * 6 + 1];
      const z = data[i * 6 + 2];
      
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
    
    const scaleX = canvas.width / (maxX - minX || 1);
    const scaleY = canvas.height / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY) * 0.8 * camera.zoom;

    let renderedCount = 0;

    // Render points
    for (let i = 0; i < pointCount; i++) {
      const baseIndex = i * 6;
      
      let x = data[baseIndex] - (minX + maxX) / 2;
      let y = data[baseIndex + 1] - (minY + maxY) / 2;
      let z = data[baseIndex + 2] - (minZ + maxZ) / 2;
      
      // Apply camera rotation
      const rotatedX = Math.cos(camera.rotationY) * x - Math.sin(camera.rotationY) * z;
      const rotatedZ = Math.sin(camera.rotationY) * x + Math.cos(camera.rotationY) * z;
      const rotatedY = Math.cos(camera.rotationX) * y - Math.sin(camera.rotationX) * rotatedZ;
      
      // Project to screen
      const screenX = centerX + rotatedX * scale;
      const screenY = centerY - rotatedY * scale;
      
      // Skip points outside canvas
      if (screenX < -5 || screenX > canvas.width + 5 || screenY < -5 || screenY > canvas.height + 5) {
        continue;
      }
      
      // Point size based on depth
      const depth = Math.max(0.1, 1 + rotatedZ);
      const pointSize = Math.max(1, 2 / depth);
      
      // Color
      const r = Math.floor(data[baseIndex + 3] * 255);
      const g = Math.floor(data[baseIndex + 4] * 255);
      const b = Math.floor(data[baseIndex + 5] * 255);
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, pointSize, 0, Math.PI * 2);
      ctx.fill();
      
      renderedCount++;
    }

    console.log('Rendered', renderedCount, 'visible points');

    // Add info overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px Arial';
    ctx.fillText(`${pointCount} points (${renderedCount} visible)`, 20, 30);
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
    
    if (splatData) {
      renderPointCloud(splatData);
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

    if (splatData) {
      renderPointCloud(splatData);
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
      renderPointCloud(splatData);
    }
  };

  const zoomIn = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.min(3, prev.zoom * 1.2)
    }));

    if (splatData) {
      renderPointCloud(splatData);
    }
  };

  const zoomOut = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1, prev.zoom * 0.8)
    }));

    if (splatData) {
      renderPointCloud(splatData);
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
                  <p className="text-sm text-gray-400 mt-2">Processing point cloud data...</p>
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
            Interactive 3D point cloud viewer. Drag to rotate and scroll to zoom for a better perspective.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GaussianSplatViewer;
