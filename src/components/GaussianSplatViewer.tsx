
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import * as THREE from 'three';
import JSZip from 'jszip';

interface GaussianSplatViewerProps {
  url?: string;
  width?: number;
  height?: number;
  isOpen?: boolean;
  onClose?: () => void;
  splatUrl?: string;
  itemTitle?: string;
}

interface SplatData {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  opacities: Float32Array;
  count: number;
  bounds: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}

const SplatRenderer: React.FC<{ splatData: SplatData | null }> = ({ splatData }) => {
  const meshRef = useRef<THREE.Points>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!splatData || !meshRef.current) return;

    console.log('Creating splat geometry with', splatData.count, 'points');
    console.log('Data bounds:', splatData.bounds);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(splatData.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(splatData.colors, 3));

    // Use scales to determine point size
    const sizes = new Float32Array(splatData.count);
    for (let i = 0; i < splatData.count; i++) {
      // Use average of the 3 scale components as point size
      const scaleIndex = i * 3;
      const avgScale = (splatData.scales[scaleIndex] + splatData.scales[scaleIndex + 1] + splatData.scales[scaleIndex + 2]) / 3;
      sizes[i] = Math.max(0.001, Math.min(0.1, avgScale)); // Clamp size
    }
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;

    // Center the geometry using computed bounds
    const centerX = (splatData.bounds.min.x + splatData.bounds.max.x) / 2;
    const centerY = (splatData.bounds.min.y + splatData.bounds.max.y) / 2;
    const centerZ = (splatData.bounds.min.z + splatData.bounds.max.z) / 2;
    
    geometry.translate(-centerX, -centerY, -centerZ);

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [splatData]);

  return splatData ? <points ref={meshRef} /> : null;
};

const GaussianSplatViewer: React.FC<GaussianSplatViewerProps> = ({
  url,
  width = 400,
  height = 300,
  isOpen,
  onClose,
  splatUrl,
  itemTitle
}) => {
  const [splatData, setSplatData] = useState<SplatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use splatUrl if provided (for modal mode), otherwise use url (for inline mode)
  const effectiveUrl = splatUrl || url;
  const isModalMode = isOpen !== undefined;

  const extractZipFile = useCallback(async (arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> => {
    console.log('Extracting ZIP file...');
    
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(arrayBuffer);
      
      // Look for PLY files in the ZIP
      const plyFiles = Object.keys(zipContent.files).filter(filename => 
        filename.toLowerCase().endsWith('.ply') && !zipContent.files[filename].dir
      );
      
      if (plyFiles.length === 0) {
        throw new Error('No PLY files found in the ZIP archive');
      }
      
      // Use the first PLY file found
      const plyFilename = plyFiles[0];
      console.log('Found PLY file in ZIP:', plyFilename);
      
      const plyFile = zipContent.files[plyFilename];
      const plyArrayBuffer = await plyFile.async('arraybuffer');
      
      console.log('Extracted PLY file size:', plyArrayBuffer.byteLength, 'bytes');
      return plyArrayBuffer;
    } catch (err) {
      console.error('Error extracting ZIP file:', err);
      throw new Error('Failed to extract PLY file from ZIP archive. Please ensure the ZIP contains a valid PLY file.');
    }
  }, []);

  const loadSplatFile = useCallback(async (fileUrl: string): Promise<SplatData> => {
    console.log('Loading splat file from:', fileUrl);
    
    try {
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream, */*',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('Loaded file size:', arrayBuffer.byteLength, 'bytes');

      // Check if it's a ZIP file by looking at the first 4 bytes
      const header = new Uint8Array(arrayBuffer, 0, 4);
      const isZip = header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04;
      
      let plyBuffer = arrayBuffer;
      
      if (isZip) {
        console.log('Detected ZIP file, extracting...');
        plyBuffer = await extractZipFile(arrayBuffer);
      }

      // Parse as PLY
      return parsePlyFile(plyBuffer);
    } catch (err) {
      console.error('Error loading splat file:', err);
      throw err;
    }
  }, [extractZipFile]);

  const unpackFloat = useCallback((packedValue: number, minVal: number, maxVal: number): number => {
    const normalized = packedValue / 255.0;
    return minVal + (normalized * (maxVal - minVal));
  }, []);

  const parsePlyFile = useCallback((buffer: ArrayBuffer): SplatData => {
    console.log('Parsing PLY file...');
    
    try {
      const text = new TextDecoder().decode(buffer);
      const lines = text.split('\n');
      
      let vertexCount = 0;
      let headerEndIndex = -1;
      let properties: string[] = [];
      let isCompressed = false;
      
      // Parse header and detect format
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('element vertex')) {
          vertexCount = parseInt(line.split(' ')[2]);
          console.log('Found', vertexCount, 'vertices in PLY header');
        } else if (line.startsWith('property')) {
          const parts = line.split(' ');
          if (parts.length >= 3) {
            properties.push(parts[2]);
            // Check if this is a compressed format
            if (parts[2].includes('packed_') || parts[2].includes('min_') || parts[2].includes('max_')) {
              isCompressed = true;
            }
          }
        } else if (line === 'end_header') {
          headerEndIndex = i;
          break;
        }
      }
      
      if (headerEndIndex === -1 || vertexCount === 0) {
        throw new Error('Invalid PLY file: missing header or vertex count');
      }

      console.log('PLY properties:', properties);
      console.log('Compressed format detected:', isCompressed);
      
      if (isCompressed) {
        return parseCompressedGaussianSplat(buffer, headerEndIndex, vertexCount, properties);
      } else {
        return parseSimplePlyFile(lines, headerEndIndex, vertexCount);
      }
    } catch (err) {
      console.error('Error parsing PLY file:', err);
      throw new Error('Failed to parse PLY file. Please ensure it\'s a valid PLY format.');
    }
  }, []);

  const parseCompressedGaussianSplat = useCallback((
    buffer: ArrayBuffer, 
    headerEndIndex: number, 
    vertexCount: number, 
    properties: string[]
  ): SplatData => {
    console.log('Processing compressed Gaussian splat format...');
    
    // Calculate header size more accurately
    const headerText = new TextDecoder().decode(buffer).split('\n').slice(0, headerEndIndex + 1).join('\n');
    const headerBytes = new TextEncoder().encode(headerText + '\n');
    const binaryDataStart = headerBytes.length;
    
    console.log('Binary data starts at byte:', binaryDataStart);
    console.log('Available binary data:', buffer.byteLength - binaryDataStart, 'bytes');
    
    // For compressed Gaussian splats, each vertex typically has:
    // - 6 floats for min/max position bounds (24 bytes)
    // - 6 floats for min/max scale bounds (24 bytes) 
    // - 4 bytes for packed colors
    // - 4 bytes for packed rotation quaternion
    // - 1 byte for opacity
    const bytesPerVertex = 57; // Conservative estimate
    
    const maxVertices = Math.min(vertexCount, Math.floor((buffer.byteLength - binaryDataStart) / bytesPerVertex));
    console.log('Processing up to', maxVertices, 'vertices');
    
    const positions = new Float32Array(maxVertices * 3);
    const colors = new Float32Array(maxVertices * 3);
    const scales = new Float32Array(maxVertices * 3);
    const opacities = new Float32Array(maxVertices);
    
    const dataView = new DataView(buffer, binaryDataStart);
    let validVertexCount = 0;
    let bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };
    
    for (let i = 0; i < maxVertices; i++) {
      try {
        const baseOffset = i * bytesPerVertex;
        
        // Check if we have enough data
        if (baseOffset + bytesPerVertex > buffer.byteLength - binaryDataStart) {
          console.log('Reached end of data at vertex', i);
          break;
        }
        
        // Read position bounds (first 24 bytes)
        const minX = dataView.getFloat32(baseOffset, true);
        const minY = dataView.getFloat32(baseOffset + 4, true);
        const minZ = dataView.getFloat32(baseOffset + 8, true);
        const maxX = dataView.getFloat32(baseOffset + 12, true);
        const maxY = dataView.getFloat32(baseOffset + 16, true);
        const maxZ = dataView.getFloat32(baseOffset + 20, true);
        
        // Validate position data
        if (isNaN(minX) || isNaN(maxX) || Math.abs(maxX - minX) > 100) {
          continue;
        }
        
        // Calculate position as center of bounds
        const posX = (minX + maxX) / 2;
        const posY = (minY + maxY) / 2;
        const posZ = (minZ + maxZ) / 2;
        
        positions[validVertexCount * 3] = posX;
        positions[validVertexCount * 3 + 1] = posY;
        positions[validVertexCount * 3 + 2] = posZ;
        
        // Update bounds
        bounds.min.x = Math.min(bounds.min.x, posX);
        bounds.min.y = Math.min(bounds.min.y, posY);
        bounds.min.z = Math.min(bounds.min.z, posZ);
        bounds.max.x = Math.max(bounds.max.x, posX);
        bounds.max.y = Math.max(bounds.max.y, posY);
        bounds.max.z = Math.max(bounds.max.z, posZ);
        
        // Read scale bounds (next 24 bytes)
        const minScaleX = dataView.getFloat32(baseOffset + 24, true);
        const minScaleY = dataView.getFloat32(baseOffset + 28, true);
        const minScaleZ = dataView.getFloat32(baseOffset + 32, true);
        const maxScaleX = dataView.getFloat32(baseOffset + 36, true);
        const maxScaleY = dataView.getFloat32(baseOffset + 40, true);
        const maxScaleZ = dataView.getFloat32(baseOffset + 44, true);
        
        // Calculate scales as center of bounds, with reasonable defaults
        scales[validVertexCount * 3] = isNaN(minScaleX) ? 0.01 : Math.max(0.001, (minScaleX + maxScaleX) / 2);
        scales[validVertexCount * 3 + 1] = isNaN(minScaleY) ? 0.01 : Math.max(0.001, (minScaleY + maxScaleY) / 2);
        scales[validVertexCount * 3 + 2] = isNaN(minScaleZ) ? 0.01 : Math.max(0.001, (minScaleZ + maxScaleZ) / 2);
        
        // Read packed color data (4 bytes)
        if (baseOffset + 52 < buffer.byteLength - binaryDataStart) {
          const colorData = dataView.getUint32(baseOffset + 48, true);
          colors[validVertexCount * 3] = ((colorData >> 0) & 0xFF) / 255.0;  // R
          colors[validVertexCount * 3 + 1] = ((colorData >> 8) & 0xFF) / 255.0;  // G
          colors[validVertexCount * 3 + 2] = ((colorData >> 16) & 0xFF) / 255.0; // B
        } else {
          // Default color if no color data
          colors[validVertexCount * 3] = 0.8;
          colors[validVertexCount * 3 + 1] = 0.8;
          colors[validVertexCount * 3 + 2] = 0.8;
        }
        
        // Read opacity (1 byte)
        if (baseOffset + 56 < buffer.byteLength - binaryDataStart) {
          opacities[validVertexCount] = dataView.getUint8(baseOffset + 56) / 255.0;
        } else {
          opacities[validVertexCount] = 1.0;
        }
        
        validVertexCount++;
      } catch (e) {
        console.warn('Error parsing vertex', i, ':', e);
        continue;
      }
    }
    
    console.log('Successfully parsed', validVertexCount, 'vertices from compressed format');
    console.log('Final bounds:', bounds);
    
    if (validVertexCount === 0) {
      throw new Error('No valid vertices found in compressed data');
    }
    
    return {
      positions: positions.slice(0, validVertexCount * 3),
      colors: colors.slice(0, validVertexCount * 3),
      scales: scales.slice(0, validVertexCount * 3),
      opacities: opacities.slice(0, validVertexCount),
      count: validVertexCount,
      bounds
    };
  }, []);

  const parseSimplePlyFile = useCallback((
    lines: string[], 
    headerEndIndex: number, 
    vertexCount: number
  ): SplatData => {
    console.log('Processing simple PLY format...');
    
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const scales = new Float32Array(vertexCount * 3);
    const opacities = new Float32Array(vertexCount);
    
    let bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };
    
    let vertexIndex = 0;
    for (let i = headerEndIndex + 1; i < lines.length && vertexIndex < vertexCount; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(/\s+/).map(v => parseFloat(v));
      if (values.length < 6) continue; // Need at least x,y,z,r,g,b
      
      // Position (x, y, z)
      const x = values[0];
      const y = values[1];
      const z = values[2];
      
      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;
      positions[vertexIndex * 3 + 2] = z;
      
      // Update bounds
      bounds.min.x = Math.min(bounds.min.x, x);
      bounds.min.y = Math.min(bounds.min.y, y);
      bounds.min.z = Math.min(bounds.min.z, z);
      bounds.max.x = Math.max(bounds.max.x, x);
      bounds.max.y = Math.max(bounds.max.y, y);
      bounds.max.z = Math.max(bounds.max.z, z);
      
      // Color (r, g, b) - normalize from 0-255 to 0-1
      colors[vertexIndex * 3] = (values[3] || 255) / 255;
      colors[vertexIndex * 3 + 1] = (values[4] || 255) / 255;
      colors[vertexIndex * 3 + 2] = (values[5] || 255) / 255;
      
      // Default scales and opacity for simple format
      scales[vertexIndex * 3] = 0.01;
      scales[vertexIndex * 3 + 1] = 0.01;
      scales[vertexIndex * 3 + 2] = 0.01;
      opacities[vertexIndex] = 1.0;
      
      vertexIndex++;
    }
    
    console.log('Successfully parsed', vertexIndex, 'vertices from simple PLY');
    
    return {
      positions,
      colors,
      scales,
      opacities,
      count: vertexIndex,
      bounds
    };
  }, []);

  useEffect(() => {
    if (!effectiveUrl) {
      setSplatData(null);
      setError(null);
      return;
    }

    console.log('Starting to load Gaussian splat from URL:', effectiveUrl);
    setLoading(true);
    setError(null);
    setSplatData(null);

    loadSplatFile(effectiveUrl)
      .then((data) => {
        console.log('Successfully loaded splat data:', data.count, 'points');
        setSplatData(data);
        setError(null);
        
        toast({
          title: "3D Model Loaded",
          description: `Successfully loaded ${data.count} splat points`,
        });
      })
      .catch((err) => {
        console.error('Failed to load splat:', err);
        const errorMessage = err.message || 'Failed to load 3D model';
        setError(errorMessage);
        setSplatData(null);
        
        toast({
          title: "Loading Failed",
          description: errorMessage,
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveUrl, loadSplatFile, toast]);

  const renderViewer = () => {
    if (!effectiveUrl) {
      return (
        <div 
          className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
          style={{ width, height }}
        >
          <p className="text-gray-500 text-sm">No 3D model available</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div 
          className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading 3D model...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div 
          className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-4"
          style={{ width, height }}
        >
          <div className="text-center">
            <p className="text-red-600 text-sm font-medium mb-1">Failed to load 3D model</p>
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        </div>
      );
    }

    if (!splatData) {
      return (
        <div 
          className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg"
          style={{ width, height }}
        >
          <p className="text-gray-500 text-sm">No model data available</p>
        </div>
      );
    }

    return (
      <div 
        className="border border-gray-200 rounded-lg overflow-hidden bg-black"
        style={{ width, height }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000');
          }}
        >
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            enableZoom={true}
            enablePan={true}
            maxDistance={20}
            minDistance={0.1}
          />
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          <SplatRenderer splatData={splatData} />
        </Canvas>
      </div>
    );
  };

  // If used as a modal
  if (isModalMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{itemTitle ? `3D View - ${itemTitle}` : '3D Model Viewer'}</DialogTitle>
            <DialogDescription>
              Interactive 3D model view. Click and drag to rotate, scroll to zoom.
              {splatData && ` Showing ${splatData.count} splat points.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-6 pt-4">
            {renderViewer()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If used as inline component
  return renderViewer();
};

export default GaussianSplatViewer;
