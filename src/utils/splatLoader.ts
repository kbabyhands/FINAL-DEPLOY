
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
  load(data: ArrayBuffer): SplatData | null {
    try {
      if (!data || data.byteLength === 0) {
        console.error('Splat Loader: No data provided');
        return null;
      }

      console.log('Splat Loader: Loading splat file, size:', data.byteLength);

      // Each splat entry is typically 32 bytes (8 floats * 4 bytes each)
      // Position (3 floats) + Scale (3 floats) + Color (4 floats RGBA) + Rotation (4 floats quaternion)
      const bytesPerSplat = 32;
      const splatCount = Math.floor(data.byteLength / bytesPerSplat);

      if (splatCount === 0) {
        console.error('Splat Loader: File too small to contain splat data');
        return null;
      }

      console.log(`Splat Loader: Processing ${splatCount} splats`);

      const dataView = new DataView(data);
      const positions = new Float32Array(splatCount * 3);
      const colors = new Float32Array(splatCount * 3);
      const scales = new Float32Array(splatCount * 3);
      const rotations = new Float32Array(splatCount * 4);
      const opacities = new Float32Array(splatCount);

      let offset = 0;
      let validSplats = 0;

      for (let i = 0; i < splatCount && offset + bytesPerSplat <= data.byteLength; i++) {
        try {
          // Read position (3 floats)
          const x = dataView.getFloat32(offset, true);
          const y = dataView.getFloat32(offset + 4, true);
          const z = dataView.getFloat32(offset + 8, true);
          
          // Read scale (3 floats)
          const scaleX = dataView.getFloat32(offset + 12, true);
          const scaleY = dataView.getFloat32(offset + 16, true);
          const scaleZ = dataView.getFloat32(offset + 20, true);
          
          // Read color/opacity (4 floats RGBA)
          const r = dataView.getFloat32(offset + 24, true);
          const g = dataView.getFloat32(offset + 28, true);
          const b = dataView.getFloat32(offset + 32, true);
          const a = dataView.getFloat32(offset + 36, true);

          // Validate data
          if (isFinite(x) && isFinite(y) && isFinite(z) && 
              isFinite(scaleX) && isFinite(scaleY) && isFinite(scaleZ) &&
              isFinite(r) && isFinite(g) && isFinite(b) && isFinite(a)) {
            
            const idx3 = validSplats * 3;
            const idx4 = validSplats * 4;

            positions[idx3] = x;
            positions[idx3 + 1] = y;
            positions[idx3 + 2] = z;

            colors[idx3] = Math.max(0, Math.min(1, r));
            colors[idx3 + 1] = Math.max(0, Math.min(1, g));
            colors[idx3 + 2] = Math.max(0, Math.min(1, b));

            scales[idx3] = Math.abs(scaleX);
            scales[idx3 + 1] = Math.abs(scaleY);
            scales[idx3 + 2] = Math.abs(scaleZ);

            // Default rotation (identity quaternion)
            rotations[idx4] = 0;
            rotations[idx4 + 1] = 0;
            rotations[idx4 + 2] = 0;
            rotations[idx4 + 3] = 1;

            opacities[validSplats] = Math.max(0, Math.min(1, a));
            validSplats++;
          }

          offset += bytesPerSplat;
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
