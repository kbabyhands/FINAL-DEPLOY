
import * as THREE from 'three';

export class PLYLoader {
  load(data: ArrayBuffer): THREE.BufferGeometry | null {
    try {
      if (!data || data.byteLength === 0) {
        console.error('PLY Loader: No data provided');
        return null;
      }

      // Convert ArrayBuffer to string to check format
      const header = new TextDecoder().decode(data.slice(0, Math.min(1000, data.byteLength)));
      const isBinary = header.includes('format binary_little_endian') || header.includes('format binary_big_endian');
      
      if (isBinary) {
        return this.parseBinaryPLY(data);
      } else {
        const text = new TextDecoder().decode(data);
        return this.parseASCIIPLY(text);
      }
    } catch (error) {
      console.error('PLY Loader: Error loading PLY file:', error);
      return null;
    }
  }

  private parseBinaryPLY(data: ArrayBuffer): THREE.BufferGeometry | null {
    try {
      const geometry = new THREE.BufferGeometry();
      const text = new TextDecoder().decode(data.slice(0, Math.min(2000, data.byteLength)));
      const headerEndIndex = text.indexOf('end_header');
      
      if (headerEndIndex === -1) {
        console.error('PLY Loader: Invalid PLY file - no end_header found');
        return null;
      }
      
      // Parse header
      const lines = text.split('\n');
      let vertexCount = 0;
      let faceCount = 0;
      const properties: { name: string; type: string }[] = [];
      
      for (const line of lines) {
        if (line.startsWith('element vertex')) {
          vertexCount = parseInt(line.split(' ')[2]);
        } else if (line.startsWith('element face')) {
          faceCount = parseInt(line.split(' ')[2]);
        } else if (line.startsWith('property')) {
          const parts = line.split(' ');
          if (parts.length >= 3) {
            properties.push({ name: parts[2], type: parts[1] });
          }
        }
      }
      
      if (vertexCount === 0) {
        console.error('PLY Loader: No vertices found in PLY file');
        return null;
      }
      
      console.log(`PLY Loader: Found ${vertexCount} vertices, ${properties.length} properties`);
      
      // Calculate header size more accurately
      const headerText = text.substring(0, headerEndIndex + 11); // +11 for 'end_header\n'
      const headerSize = new TextEncoder().encode(headerText).length;
      
      // Parse binary data
      const dataView = new DataView(data, headerSize);
      const vertices: number[] = [];
      const colors: number[] = [];
      let offset = 0;
      
      for (let i = 0; i < vertexCount && offset < dataView.byteLength - 12; i++) {
        let x = 0, y = 0, z = 0;
        let r = 128, g = 128, b = 128; // Default grey color
        
        for (const prop of properties) {
          if (offset >= dataView.byteLength) break;
          
          try {
            switch (prop.name) {
              case 'x':
                x = dataView.getFloat32(offset, true);
                offset += 4;
                break;
              case 'y':
                y = dataView.getFloat32(offset, true);
                offset += 4;
                break;
              case 'z':
                z = dataView.getFloat32(offset, true);
                offset += 4;
                break;
              case 'red':
                r = dataView.getUint8(offset);
                offset += 1;
                break;
              case 'green':
                g = dataView.getUint8(offset);
                offset += 1;
                break;
              case 'blue':
                b = dataView.getUint8(offset);
                offset += 1;
                break;
              case 'alpha':
                // Skip alpha channel
                offset += 1;
                break;
              default:
                // Skip unknown properties safely
                if (prop.type === 'float' && offset + 4 <= dataView.byteLength) {
                  offset += 4;
                } else if (prop.type === 'uchar' && offset + 1 <= dataView.byteLength) {
                  offset += 1;
                } else if (prop.type === 'int' && offset + 4 <= dataView.byteLength) {
                  offset += 4;
                } else if (prop.type === 'ushort' && offset + 2 <= dataView.byteLength) {
                  offset += 2;
                }
                break;
            }
          } catch (error) {
            console.warn(`PLY Loader: Error reading property ${prop.name}:`, error);
            break;
          }
        }
        
        // Only add vertex if coordinates are valid
        if (!isNaN(x) && !isNaN(y) && !isNaN(z) && isFinite(x) && isFinite(y) && isFinite(z)) {
          vertices.push(x, y, z);
          colors.push(r / 255, g / 255, b / 255);
        }
      }
      
      if (vertices.length === 0) {
        console.error('PLY Loader: No valid vertex data extracted');
        return null;
      }
      
      console.log(`PLY Loader: Extracted ${vertices.length / 3} valid vertices`);
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeBoundingSphere();
      
      // Log bounding information for debugging
      if (geometry.boundingSphere) {
        console.log(`PLY Loader: Bounding sphere center:`, geometry.boundingSphere.center);
        console.log(`PLY Loader: Bounding sphere radius:`, geometry.boundingSphere.radius);
      }
      
      return geometry;
    } catch (error) {
      console.error('PLY Loader: Error parsing binary PLY:', error);
      return null;
    }
  }

  private parseASCIIPLY(text: string): THREE.BufferGeometry | null {
    try {
      if (!text || text.trim().length === 0) {
        console.error('PLY Loader: Empty text data');
        return null;
      }

      const geometry = new THREE.BufferGeometry();
      const lines = text.split('\n');
      
      let vertexCount = 0;
      let faceCount = 0;
      let headerEnd = 0;
      
      // Parse header
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('element vertex')) {
          vertexCount = parseInt(line.split(' ')[2]);
        } else if (line.startsWith('element face')) {
          faceCount = parseInt(line.split(' ')[2]);
        } else if (line === 'end_header') {
          headerEnd = i + 1;
          break;
        }
      }
      
      if (vertexCount === 0 || headerEnd === 0) {
        console.error('PLY Loader: Invalid ASCII PLY format');
        return null;
      }
      
      // Parse vertices
      const vertices: number[] = [];
      const colors: number[] = [];
      
      for (let i = headerEnd; i < Math.min(headerEnd + vertexCount, lines.length); i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length >= 3) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          const z = parseFloat(parts[2]);
          
          if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            vertices.push(x, y, z);
            
            // Handle colors if present
            if (parts.length >= 6) {
              const r = parseInt(parts[3]) / 255;
              const g = parseInt(parts[4]) / 255;
              const b = parseInt(parts[5]) / 255;
              colors.push(isNaN(r) ? 0.8 : r, isNaN(g) ? 0.8 : g, isNaN(b) ? 0.8 : b);
            } else {
              colors.push(0.8, 0.8, 0.8); // Default grey color
            }
          }
        }
      }
      
      if (vertices.length === 0) {
        console.error('PLY Loader: No valid vertex data found');
        return null;
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeBoundingSphere();
      
      console.log(`PLY Loader: Successfully loaded ${vertices.length / 3} vertices`);
      return geometry;
    } catch (error) {
      console.error('PLY Loader: Error parsing ASCII PLY:', error);
      return null;
    }
  }
}
