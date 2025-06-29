
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface GaussianSplatViewerProps {
  url: string;
  width?: number;
  height?: number;
}

interface SplatData {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
}

const SplatRenderer: React.FC<{ splatData: SplatData | null }> = ({ splatData }) => {
  const meshRef = useRef<THREE.Points>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!splatData || !meshRef.current) return;

    console.log('Creating splat geometry with', splatData.count, 'points');

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(splatData.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(splatData.colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      sizeAttenuation: true,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;

    // Center the geometry
    geometry.computeBoundingSphere();
    if (geometry.boundingSphere) {
      const center = geometry.boundingSphere.center;
      geometry.translate(-center.x, -center.y, -center.z);
    }

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
  height = 300
}) => {
  const [splatData, setSplatData] = useState<SplatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Check if it's a ZIP file
      const isZip = new Uint8Array(arrayBuffer, 0, 4).toString() === '80,75,3,4';
      
      if (isZip) {
        console.log('Detected ZIP file, extracting...');
        // For now, we'll throw an error for ZIP files as they need special handling
        throw new Error('ZIP files are not currently supported. Please upload a raw PLY file.');
      }

      // Try to parse as PLY
      return parsePlyFile(arrayBuffer);
    } catch (err) {
      console.error('Error loading splat file:', err);
      throw err;
    }
  }, []);

  const parsePlyFile = useCallback((buffer: ArrayBuffer): SplatData => {
    console.log('Parsing PLY file...');
    
    try {
      const text = new TextDecoder().decode(buffer);
      const lines = text.split('\n');
      
      let vertexCount = 0;
      let headerEndIndex = -1;
      let properties: string[] = [];
      
      // Parse header
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('element vertex')) {
          vertexCount = parseInt(line.split(' ')[2]);
          console.log('Found', vertexCount, 'vertices in PLY header');
        } else if (line.startsWith('property')) {
          const parts = line.split(' ');
          if (parts.length >= 3) {
            properties.push(parts[2]);
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
      
      const positions = new Float32Array(vertexCount * 3);
      const colors = new Float32Array(vertexCount * 3);
      
      // Parse vertex data
      let vertexIndex = 0;
      for (let i = headerEndIndex + 1; i < lines.length && vertexIndex < vertexCount; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(/\s+/).map(v => parseFloat(v));
        if (values.length < 6) continue; // Need at least x,y,z,r,g,b
        
        // Position (x, y, z)
        positions[vertexIndex * 3] = values[0];
        positions[vertexIndex * 3 + 1] = values[1];
        positions[vertexIndex * 3 + 2] = values[2];
        
        // Color (r, g, b) - normalize from 0-255 to 0-1
        colors[vertexIndex * 3] = (values[3] || 255) / 255;
        colors[vertexIndex * 3 + 1] = (values[4] || 255) / 255;
        colors[vertexIndex * 3 + 2] = (values[5] || 255) / 255;
        
        vertexIndex++;
      }
      
      console.log('Successfully parsed', vertexIndex, 'vertices from PLY');
      
      return {
        positions,
        colors,
        count: vertexIndex
      };
    } catch (err) {
      console.error('Error parsing PLY file:', err);
      throw new Error('Failed to parse PLY file. Please ensure it\'s a valid ASCII PLY format.');
    }
  }, []);

  useEffect(() => {
    if (!url) {
      setSplatData(null);
      setError(null);
      return;
    }

    console.log('Starting to load Gaussian splat from URL:', url);
    setLoading(true);
    setError(null);
    setSplatData(null);

    loadSplatFile(url)
      .then((data) => {
        console.log('Successfully loaded splat data:', data.count, 'points');
        setSplatData(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load splat:', err);
        setError(err.message || 'Failed to load 3D model');
        setSplatData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [url, loadSplatFile]);

  if (!url) {
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
        <OrbitControls enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SplatRenderer splatData={splatData} />
      </Canvas>
    </div>
  );
};

export default GaussianSplatViewer;
