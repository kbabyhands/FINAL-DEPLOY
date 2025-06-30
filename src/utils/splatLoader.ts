import * as THREE from 'three';

export interface SplatData {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  rotations: Float32Array;
  opacities: Float32Array;
  count: number;
  bounds: {
    min: THREE.Vector3;
    max: THREE.Vector3;
    center: THREE.Vector3;
    size: THREE.Vector3;
  };
}

export interface SplatFormat {
  type: 'ply_gaussian' | 'binary_splat' | 'compressed_splat';
  bytesPerSplat: number;
  hasColors: boolean;
  hasOpacity: boolean;
  hasRotation: boolean;
  hasScale: boolean;
}

export class SplatLoader {
  private static readonly SUPPORTED_FORMATS: SplatFormat[] = [
    {
      type: 'ply_gaussian',
      bytesPerSplat: 62, // Common Gaussian PLY format
      hasColors: true,
      hasOpacity: true,
      hasRotation: true,
      hasScale: true
    },
    {
      type: 'binary_splat',
      bytesPerSplat: 56, // Standard binary splat
      hasColors: true,
      hasOpacity: true,
      hasRotation: true,
      hasScale: true
    },
    {
      type: 'compressed_splat',
      bytesPerSplat: 32, // Compressed format
      hasColors: true,
      hasOpacity: false,
      hasRotation: false,
      hasScale: true
    }
  ];

  load(data: ArrayBuffer, maxSplats?: number): SplatData | null {
    try {
      if (!data || data.byteLength === 0) {
        console.error('SplatLoader: No data provided');
        return null;
      }

      console.log('SplatLoader: Processing file, size:', data.byteLength);

      // Detect format
      const format = this.detectFormat(data);
      if (!format) {
        console.error('SplatLoader: Could not detect splat format');
        return null;
      }

      console.log('SplatLoader: Detected format:', format.type, 'bytes per splat:', format.bytesPerSplat);

      // Parse data based on detected format
      switch (format.type) {
        case 'ply_gaussian':
          return this.parsePLYGaussian(data, maxSplats);
        case 'binary_splat':
          return this.parseBinarySplat(data, format, maxSplats);
        case 'compressed_splat':
          return this.parseCompressedSplat(data, format, maxSplats);
        default:
          console.error('SplatLoader: Unsupported format:', format.type);
          return null;
      }
    } catch (error) {
      console.error('SplatLoader: Error loading splat file:', error);
      return null;
    }
  }

  private detectFormat(data: ArrayBuffer): SplatFormat | null {
    // Check if it's a PLY file first
    const header = new TextDecoder().decode(data.slice(0, Math.min(512, data.byteLength)));
    if (header.includes('ply') && header.includes('format')) {
      return SplatLoader.SUPPORTED_FORMATS.find(f => f.type === 'ply_gaussian') || null;
    }

    // Try different binary formats by checking if file size is divisible by bytes per splat
    for (const format of SplatLoader.SUPPORTED_FORMATS) {
      if (format.type !== 'ply_gaussian') {
        const remainder = data.byteLength % format.bytesPerSplat;
        if (remainder === 0 || remainder < 16) { // Allow small header
          const headerSize = remainder;
          const splatCount = Math.floor((data.byteLength - headerSize) / format.bytesPerSplat);
          if (splatCount > 100) { // Reasonable minimum
            console.log(`SplatLoader: Format ${format.type} matches - ${splatCount} splats`);
            return format;
          }
        }
      }
    }

    return null;
  }

  private parsePLYGaussian(data: ArrayBuffer, maxSplats?: number): SplatData | null {
    // Use existing PLY parsing logic but with better validation
    const text = new TextDecoder().decode(data.slice(0, Math.min(2000, data.byteLength)));
    const headerEndIndex = text.indexOf('end_header');
    
    if (headerEndIndex === -1) {
      console.error('SplatLoader: Invalid PLY - no end_header found');
      return null;
    }

    const lines = text.split('\n');
    let vertexCount = 0;
    const properties: Array<{ name: string; type: string }> = [];
    
    for (const line of lines) {
      if (line.startsWith('element vertex')) {
        vertexCount = parseInt(line.split(' ')[2]);
      } else if (line.startsWith('property')) {
        const parts = line.split(' ');
        if (parts.length >= 3) {
          properties.push({ name: parts[2], type: parts[1] });
        }
      }
    }

    if (vertexCount === 0) {
      console.error('SplatLoader: No vertices in PLY');
      return null;
    }

    // Calculate actual header size
    const headerText = text.substring(0, headerEndIndex + 11);
    const headerSize = new TextEncoder().encode(headerText).length;
    
    return this.parseSplatData(data, headerSize, vertexCount, properties, maxSplats);
  }

  private parseBinarySplat(data: ArrayBuffer, format: SplatFormat, maxSplats?: number): SplatData | null {
    const headerSize = data.byteLength % format.bytesPerSplat;
    const splatCount = Math.floor((data.byteLength - headerSize) / format.bytesPerSplat);
    
    console.log(`SplatLoader: Binary splat - ${splatCount} splats, header size: ${headerSize}`);
    
    // Define standard property layout for binary splats
    const properties = [
      { name: 'x', type: 'float' },
      { name: 'y', type: 'float' },
      { name: 'z', type: 'float' },
      { name: 'scale_0', type: 'float' },
      { name: 'scale_1', type: 'float' },
      { name: 'scale_2', type: 'float' },
      { name: 'red', type: 'uchar' },
      { name: 'green', type: 'uchar' },
      { name: 'blue', type: 'uchar' },
      { name: 'opacity', type: 'uchar' },
      { name: 'rot_0', type: 'float' },
      { name: 'rot_1', type: 'float' },
      { name: 'rot_2', type: 'float' },
      { name: 'rot_3', type: 'float' }
    ];

    return this.parseSplatData(data, headerSize, splatCount, properties, maxSplats);
  }

  private parseCompressedSplat(data: ArrayBuffer, format: SplatFormat, maxSplats?: number): SplatData | null {
    const headerSize = data.byteLength % format.bytesPerSplat;
    const splatCount = Math.floor((data.byteLength - headerSize) / format.bytesPerSplat);
    
    console.log(`SplatLoader: Compressed splat - ${splatCount} splats`);
    
    // Compressed format with reduced data
    const properties = [
      { name: 'x', type: 'float' },
      { name: 'y', type: 'float' },
      { name: 'z', type: 'float' },
      { name: 'scale_0', type: 'float' },
      { name: 'scale_1', type: 'float' },
      { name: 'scale_2', type: 'float' },
      { name: 'red', type: 'uchar' },
      { name: 'green', type: 'uchar' },
      { name: 'blue', type: 'uchar' },
      { name: 'opacity', type: 'uchar' }
    ];

    return this.parseSplatData(data, headerSize, splatCount, properties, maxSplats);
  }

  private parseSplatData(
    data: ArrayBuffer, 
    headerOffset: number, 
    totalSplats: number, 
    properties: Array<{ name: string; type: string }>, 
    maxSplats?: number
  ): SplatData | null {
    const targetSplatCount = Math.min(totalSplats, maxSplats || 150000);
    console.log(`SplatLoader: Loading ${targetSplatCount} of ${totalSplats} splats`);

    const dataView = new DataView(data, headerOffset);
    const positions = new Float32Array(targetSplatCount * 3);
    const colors = new Float32Array(targetSplatCount * 3);
    const scales = new Float32Array(targetSplatCount * 3);
    const rotations = new Float32Array(targetSplatCount * 4);
    const opacities = new Float32Array(targetSplatCount);

    // Calculate bytes per splat from properties
    let bytesPerSplat = 0;
    for (const prop of properties) {
      switch (prop.type) {
        case 'float': bytesPerSplat += 4; break;
        case 'uchar': bytesPerSplat += 1; break;
        case 'int': bytesPerSplat += 4; break;
        case 'ushort': bytesPerSplat += 2; break;
        default: bytesPerSplat += 4; break;
      }
    }

    let validSplats = 0;
    const skipInterval = Math.max(1, Math.floor(totalSplats / targetSplatCount));
    
    // Bounds tracking
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < totalSplats && validSplats < targetSplatCount; i += skipInterval) {
      let offset = i * bytesPerSplat;
      
      if (offset + bytesPerSplat > dataView.byteLength) break;

      try {
        let x = 0, y = 0, z = 0;
        let scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1;
        let r = 0.5, g = 0.5, b = 0.5, a = 0.8;
        let qx = 0, qy = 0, qz = 0, qw = 1;

        // Parse properties in order
        let propertyOffset = 0;
        for (const prop of properties) {
          const value = this.readProperty(dataView, offset + propertyOffset, prop.type);
          
          switch (prop.name) {
            case 'x': x = value; break;
            case 'y': y = value; break;
            case 'z': z = value; break;
            case 'scale_0': case 'scale_x': scaleX = Math.exp(value); break; // Convert from log space
            case 'scale_1': case 'scale_y': scaleY = Math.exp(value); break;
            case 'scale_2': case 'scale_z': scaleZ = Math.exp(value); break;
            case 'red': r = value / 255; break;
            case 'green': g = value / 255; break;
            case 'blue': b = value / 255; break;
            case 'opacity': case 'alpha': a = value / 255; break;
            case 'rot_0': case 'qx': qx = value; break;
            case 'rot_1': case 'qy': qy = value; break;
            case 'rot_2': case 'qz': qz = value; break;
            case 'rot_3': case 'qw': qw = value; break;
          }

          propertyOffset += this.getPropertySize(prop.type);
        }

        // Validate and store data
        if (this.isValidSplat(x, y, z, scaleX, scaleY, scaleZ, r, g, b, a)) {
          const idx3 = validSplats * 3;
          const idx4 = validSplats * 4;

          positions[idx3] = x;
          positions[idx3 + 1] = y;
          positions[idx3 + 2] = z;

          // Update bounds
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          minZ = Math.min(minZ, z);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);

          colors[idx3] = Math.max(0, Math.min(1, r));
          colors[idx3 + 1] = Math.max(0, Math.min(1, g));
          colors[idx3 + 2] = Math.max(0, Math.min(1, b));

          // Clamp scales
          scales[idx3] = Math.max(0.001, Math.min(1.0, scaleX));
          scales[idx3 + 1] = Math.max(0.001, Math.min(1.0, scaleY));
          scales[idx3 + 2] = Math.max(0.001, Math.min(1.0, scaleZ));

          // Normalize quaternion
          const qLength = Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
          if (qLength > 0.001) {
            rotations[idx4] = qx / qLength;
            rotations[idx4 + 1] = qy / qLength;
            rotations[idx4 + 2] = qz / qLength;
            rotations[idx4 + 3] = qw / qLength;
          } else {
            rotations[idx4] = 0;
            rotations[idx4 + 1] = 0;
            rotations[idx4 + 2] = 0;
            rotations[idx4 + 3] = 1;
          }

          opacities[validSplats] = Math.max(0.1, Math.min(1.0, a));
          validSplats++;
        }
      } catch (error) {
        console.warn(`SplatLoader: Error reading splat ${i}:`, error);
        break;
      }
    }

    if (validSplats === 0) {
      console.error('SplatLoader: No valid splats found');
      return null;
    }

    // Calculate bounds
    const bounds = {
      min: new THREE.Vector3(minX, minY, minZ),
      max: new THREE.Vector3(maxX, maxY, maxZ),
      center: new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2),
      size: new THREE.Vector3(maxX - minX, maxY - minY, maxZ - minZ)
    };

    console.log(`SplatLoader: Successfully loaded ${validSplats} splats`);
    console.log('SplatLoader: Bounds:', bounds);

    return {
      positions: positions.slice(0, validSplats * 3),
      colors: colors.slice(0, validSplats * 3),
      scales: scales.slice(0, validSplats * 3),
      rotations: rotations.slice(0, validSplats * 4),
      opacities: opacities.slice(0, validSplats),
      count: validSplats,
      bounds
    };
  }

  private readProperty(dataView: DataView, offset: number, type: string): number {
    switch (type) {
      case 'float':
        return dataView.getFloat32(offset, true);
      case 'uchar':
        return dataView.getUint8(offset);
      case 'int':
        return dataView.getInt32(offset, true);
      case 'ushort':
        return dataView.getUint16(offset, true);
      default:
        return dataView.getFloat32(offset, true);
    }
  }

  private getPropertySize(type: string): number {
    switch (type) {
      case 'float': return 4;
      case 'uchar': return 1;
      case 'int': return 4;
      case 'ushort': return 2;
      default: return 4;
    }
  }

  private isValidSplat(x: number, y: number, z: number, sx: number, sy: number, sz: number, r: number, g: number, b: number, a: number): boolean {
    return isFinite(x) && isFinite(y) && isFinite(z) &&
           isFinite(sx) && isFinite(sy) && isFinite(sz) &&
           isFinite(r) && isFinite(g) && isFinite(b) && isFinite(a) &&
           sx > 0 && sy > 0 && sz > 0 &&
           r >= 0 && g >= 0 && b >= 0 && a >= 0;
  }
}
