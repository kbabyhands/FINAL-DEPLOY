
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

export class SplatLoader {
  load(data: ArrayBuffer, maxSplats = 50000): SplatData | null {
    try {
      console.log('SplatLoader: Loading file, size:', data.byteLength);
      
      if (!data || data.byteLength === 0) {
        console.error('No data provided');
        return null;
      }

      // Try PLY format first
      const text = new TextDecoder().decode(data.slice(0, 2000));
      if (text.includes('ply') && text.includes('format')) {
        return this.parsePLY(data, maxSplats);
      }

      // Try binary formats
      const bytesPerSplat = [32, 44, 56, 62];
      for (const bytes of bytesPerSplat) {
        const remainder = data.byteLength % bytes;
        if (remainder < 16) {
          const count = Math.floor((data.byteLength - remainder) / bytes);
          if (count > 100) {
            console.log(`Trying binary format: ${count} splats, ${bytes} bytes each`);
            return this.parseBinary(data, remainder, count, bytes, maxSplats);
          }
        }
      }

      console.error('Could not detect file format');
      return null;
    } catch (error) {
      console.error('Load error:', error);
      return null;
    }
  }

  private parsePLY(data: ArrayBuffer, maxSplats: number): SplatData | null {
    const text = new TextDecoder().decode(data.slice(0, 4000));
    const headerEnd = text.indexOf('end_header');
    if (headerEnd === -1) return null;

    const lines = text.split('\n');
    let vertexCount = 0;
    const properties: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('element vertex')) {
        vertexCount = parseInt(line.split(' ')[2]);
      } else if (line.startsWith('property float')) {
        properties.push(line.split(' ')[2]);
      } else if (line.startsWith('property uchar')) {
        properties.push(line.split(' ')[2]);
      }
    }

    if (vertexCount === 0) return null;

    const headerSize = new TextEncoder().encode(text.substring(0, headerEnd + 11)).length;
    console.log(`PLY: ${vertexCount} vertices, ${properties.length} properties`);
    
    return this.parseData(data, headerSize, vertexCount, properties, maxSplats);
  }

  private parseBinary(data: ArrayBuffer, headerSize: number, count: number, bytesPerSplat: number, maxSplats: number): SplatData | null {
    // Standard property order for binary files
    const properties = ['x', 'y', 'z', 'scale_0', 'scale_1', 'scale_2', 'red', 'green', 'blue', 'opacity', 'rot_0', 'rot_1', 'rot_2', 'rot_3'];
    return this.parseData(data, headerSize, count, properties, maxSplats, bytesPerSplat);
  }

  private parseData(data: ArrayBuffer, headerSize: number, totalSplats: number, properties: string[], maxSplats: number, fixedBytesPerSplat?: number): SplatData | null {
    const targetCount = Math.min(totalSplats, maxSplats);
    console.log(`Parsing ${targetCount} of ${totalSplats} splats`);

    const positions = new Float32Array(targetCount * 3);
    const colors = new Float32Array(targetCount * 3);
    const scales = new Float32Array(targetCount * 3);
    const rotations = new Float32Array(targetCount * 4);
    const opacities = new Float32Array(targetCount);

    const dataView = new DataView(data, headerSize);
    
    // Calculate bytes per splat
    let bytesPerSplat = fixedBytesPerSplat || 0;
    if (!bytesPerSplat) {
      for (const prop of properties) {
        if (['red', 'green', 'blue', 'opacity'].includes(prop)) {
          bytesPerSplat += 1;
        } else {
          bytesPerSplat += 4;
        }
      }
    }

    let validCount = 0;
    const skipStep = Math.max(1, Math.floor(totalSplats / targetCount));
    
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < totalSplats && validCount < targetCount; i += skipStep) {
      const offset = i * bytesPerSplat;
      if (offset + bytesPerSplat > dataView.byteLength) break;

      try {
        let x = 0, y = 0, z = 0;
        let sx = 0.1, sy = 0.1, sz = 0.1;
        let r = 0.5, g = 0.5, b = 0.5, a = 1.0;
        let qx = 0, qy = 0, qz = 0, qw = 1;

        let propOffset = 0;
        for (const prop of properties) {
          let value: number;
          
          if (['red', 'green', 'blue', 'opacity'].includes(prop)) {
            value = dataView.getUint8(offset + propOffset) / 255;
            propOffset += 1;
          } else {
            value = dataView.getFloat32(offset + propOffset, true);
            propOffset += 4;
          }

          switch (prop) {
            case 'x': x = value; break;
            case 'y': y = value; break;
            case 'z': z = value; break;
            case 'scale_0': case 'scale_x': sx = Math.max(0.01, Math.abs(value)); break;
            case 'scale_1': case 'scale_y': sy = Math.max(0.01, Math.abs(value)); break;
            case 'scale_2': case 'scale_z': sz = Math.max(0.01, Math.abs(value)); break;
            case 'red': r = Math.max(0.1, value); break;
            case 'green': g = Math.max(0.1, value); break;
            case 'blue': b = Math.max(0.1, value); break;
            case 'opacity': case 'alpha': a = Math.max(0.1, value); break;
            case 'rot_0': case 'qx': qx = value; break;
            case 'rot_1': case 'qy': qy = value; break;
            case 'rot_2': case 'qz': qz = value; break;
            case 'rot_3': case 'qw': qw = value; break;
          }
        }

        // Validate
        if (isFinite(x) && isFinite(y) && isFinite(z) && isFinite(sx) && isFinite(sy) && isFinite(sz)) {
          const idx = validCount * 3;
          const idx4 = validCount * 4;

          positions[idx] = x;
          positions[idx + 1] = y;
          positions[idx + 2] = z;

          colors[idx] = r;
          colors[idx + 1] = g;
          colors[idx + 2] = b;

          scales[idx] = sx;
          scales[idx + 1] = sy;
          scales[idx + 2] = sz;

          // Normalize quaternion
          const qLen = Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
          if (qLen > 0.001) {
            rotations[idx4] = qx / qLen;
            rotations[idx4 + 1] = qy / qLen;
            rotations[idx4 + 2] = qz / qLen;
            rotations[idx4 + 3] = qw / qLen;
          } else {
            rotations[idx4] = 0;
            rotations[idx4 + 1] = 0;
            rotations[idx4 + 2] = 0;
            rotations[idx4 + 3] = 1;
          }

          opacities[validCount] = a;

          // Update bounds
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          minZ = Math.min(minZ, z);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);

          validCount++;
        }
      } catch (error) {
        console.warn(`Error reading splat ${i}:`, error);
        break;
      }
    }

    if (validCount === 0) {
      console.error('No valid splats found');
      return null;
    }

    const bounds = {
      min: new THREE.Vector3(minX, minY, minZ),
      max: new THREE.Vector3(maxX, maxY, maxZ),
      center: new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2),
      size: new THREE.Vector3(maxX - minX, maxY - minY, maxZ - minZ)
    };

    console.log(`Successfully loaded ${validCount} splats`);
    console.log('Bounds:', bounds);

    return {
      positions: positions.slice(0, validCount * 3),
      colors: colors.slice(0, validCount * 3),
      scales: scales.slice(0, validCount * 3),
      rotations: rotations.slice(0, validCount * 4),
      opacities: opacities.slice(0, validCount),
      count: validCount,
      bounds
    };
  }
}
