
import * as THREE from 'three';

export interface SplatData {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  rotations: Float32Array;
  opacities: Float32Array;
  count: number;
}

export class SplatLoader {
  load(data: ArrayBuffer, maxSplats?: number): SplatData | null {
    try {
      if (!data || data.byteLength === 0) {
        console.error('Splat Loader: No data provided');
        return null;
      }

      console.log('Splat Loader: Loading splat file, size:', data.byteLength);

      // Try different splat formats - some files have different structures
      // Standard format: position(3) + scale(3) + color(4) + rotation(4) = 14 floats = 56 bytes
      // Compact format: position(3) + scale(3) + color(3) + opacity(1) + rotation(4) = 14 floats = 56 bytes
      // Simple format: position(3) + scale(3) + color(4) = 10 floats = 40 bytes
      
      let bytesPerSplat = 56; // Try standard format first
      let maxPossibleSplats = Math.floor(data.byteLength / bytesPerSplat);
      
      if (maxPossibleSplats === 0) {
        // Try compact format
        bytesPerSplat = 40;
        maxPossibleSplats = Math.floor(data.byteLength / bytesPerSplat);
      }

      if (maxPossibleSplats === 0) {
        // Try even smaller format
        bytesPerSplat = 32;
        maxPossibleSplats = Math.floor(data.byteLength / bytesPerSplat);
      }

      if (maxPossibleSplats === 0) {
        console.error('Splat Loader: File too small to contain splat data');
        return null;
      }

      // Limit the number of splats for performance
      const targetSplatCount = Math.min(maxPossibleSplats, maxSplats || 100000);
      console.log(`Splat Loader: Processing ${targetSplatCount} splats (max possible: ${maxPossibleSplats}, bytes per splat: ${bytesPerSplat})`);

      const dataView = new DataView(data);
      const positions = new Float32Array(targetSplatCount * 3);
      const colors = new Float32Array(targetSplatCount * 3);
      const scales = new Float32Array(targetSplatCount * 3);
      const rotations = new Float32Array(targetSplatCount * 4);
      const opacities = new Float32Array(targetSplatCount);

      let offset = 0;
      let validSplats = 0;

      // Sample splats evenly across the file for better representation
      const skipInterval = Math.max(1, Math.floor(maxPossibleSplats / targetSplatCount));

      for (let i = 0; i < maxPossibleSplats && validSplats < targetSplatCount; i += skipInterval) {
        offset = i * bytesPerSplat;
        
        // Safety check for remaining bytes
        if (offset + bytesPerSplat > data.byteLength) {
          console.warn(`Splat Loader: Reached end of file at splat ${i}, stopping`);
          break;
        }

        try {
          // Read position (3 floats)
          const x = dataView.getFloat32(offset, true);
          const y = dataView.getFloat32(offset + 4, true);
          const z = dataView.getFloat32(offset + 8, true);
          
          // Read scale (3 floats)
          const scaleX = dataView.getFloat32(offset + 12, true);
          const scaleY = dataView.getFloat32(offset + 16, true);
          const scaleZ = dataView.getFloat32(offset + 20, true);
          
          // Read color (3 or 4 floats depending on format)
          let r = 0.5, g = 0.5, b = 0.5, a = 0.8;
          
          if (bytesPerSplat >= 40) {
            r = dataView.getFloat32(offset + 24, true);
            g = dataView.getFloat32(offset + 28, true);
            b = dataView.getFloat32(offset + 32, true);
            
            if (bytesPerSplat >= 56) {
              // Standard format with separate opacity
              a = dataView.getFloat32(offset + 36, true);
            } else {
              // Compact format - opacity might be in the 4th color component or separate
              if (offset + 36 < data.byteLength) {
                a = dataView.getFloat32(offset + 36, true);
              }
            }
          }
          
          // Read rotation (4 floats quaternion) - if available
          let qx = 0, qy = 0, qz = 0, qw = 1;
          const rotationOffset = bytesPerSplat >= 56 ? 40 : (bytesPerSplat >= 40 ? 36 : 32);
          
          if (offset + rotationOffset + 16 <= data.byteLength) {
            qx = dataView.getFloat32(offset + rotationOffset, true);
            qy = dataView.getFloat32(offset + rotationOffset + 4, true);
            qz = dataView.getFloat32(offset + rotationOffset + 8, true);
            qw = dataView.getFloat32(offset + rotationOffset + 12, true);
            
            // Normalize quaternion
            const qLength = Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
            if (qLength > 0) {
              qx /= qLength;
              qy /= qLength;
              qz /= qLength;
              qw /= qLength;
            } else {
              qx = qy = qz = 0;
              qw = 1;
            }
          }

          // Validate data
          if (isFinite(x) && isFinite(y) && isFinite(z) && 
              isFinite(scaleX) && isFinite(scaleY) && isFinite(scaleZ) &&
              isFinite(r) && isFinite(g) && isFinite(b) && isFinite(a)) {
            
            const idx3 = validSplats * 3;
            const idx4 = validSplats * 4;

            positions[idx3] = x;
            positions[idx3 + 1] = y;
            positions[idx3 + 2] = z;

            // Ensure colors are in valid range and enhance them
            colors[idx3] = Math.max(0, Math.min(1, Math.abs(r)));
            colors[idx3 + 1] = Math.max(0, Math.min(1, Math.abs(g)));
            colors[idx3 + 2] = Math.max(0, Math.min(1, Math.abs(b)));

            // Apply reasonable scale limits and convert from log space if needed
            scales[idx3] = Math.max(0.01, Math.min(2.0, Math.abs(scaleX)));
            scales[idx3 + 1] = Math.max(0.01, Math.min(2.0, Math.abs(scaleY)));
            scales[idx3 + 2] = Math.max(0.01, Math.min(2.0, Math.abs(scaleZ)));

            rotations[idx4] = qx;
            rotations[idx4 + 1] = qy;
            rotations[idx4 + 2] = qz;
            rotations[idx4 + 3] = qw;

            opacities[validSplats] = Math.max(0.1, Math.min(1.0, Math.abs(a)));
            validSplats++;
          }
        } catch (error) {
          console.warn(`Splat Loader: Error reading splat ${i}:`, error);
          break;
        }
      }

      if (validSplats === 0) {
        console.error('Splat Loader: No valid splat data found');
        return null;
      }

      console.log(`Splat Loader: Successfully loaded ${validSplats} valid splats`);

      return {
        positions: positions.slice(0, validSplats * 3),
        colors: colors.slice(0, validSplats * 3),
        scales: scales.slice(0, validSplats * 3),
        rotations: rotations.slice(0, validSplats * 4),
        opacities: opacities.slice(0, validSplats),
        count: validSplats
      };
    } catch (error) {
      console.error('Splat Loader: Error loading splat file:', error);
      return null;
    }
  }
}
