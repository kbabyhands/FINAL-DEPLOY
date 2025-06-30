
import * as THREE from 'three';

export class PLYLoader {
  load(data: ArrayBuffer): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Convert ArrayBuffer to string to check format
    const header = new TextDecoder().decode(data.slice(0, 1000));
    const isBinary = header.includes('format binary_little_endian') || header.includes('format binary_big_endian');
    
    if (isBinary) {
      return this.parseBinaryPLY(data);
    } else {
      const text = new TextDecoder().decode(data);
      return this.parseASCIIPLY(text);
    }
  }

  private parseBinaryPLY(data: ArrayBuffer): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const text = new TextDecoder().decode(data.slice(0, 2000));
    const headerEndIndex = text.indexOf('end_header') + 10;
    
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
        properties.push({ name: parts[2], type: parts[1] });
      }
    }
    
    // Parse binary data
    const dataView = new DataView(data, headerEndIndex + 1);
    const vertices: number[] = [];
    const colors: number[] = [];
    let offset = 0;
    
    for (let i = 0; i < vertexCount; i++) {
      let x = 0, y = 0, z = 0;
      let r = 255, g = 255, b = 255;
      
      for (const prop of properties) {
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
          default:
            // Skip unknown properties
            if (prop.type === 'float') offset += 4;
            else if (prop.type === 'uchar') offset += 1;
            break;
        }
      }
      
      vertices.push(x, y, z);
      colors.push(r / 255, g / 255, b / 255);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
    
    return geometry;
  }

  private parseASCIIPLY(text: string): THREE.BufferGeometry {
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
    
    // Parse vertices
    const vertices: number[] = [];
    const colors: number[] = [];
    
    for (let i = headerEnd; i < headerEnd + vertexCount; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 3) {
        vertices.push(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]));
        
        // Handle colors if present
        if (parts.length >= 6) {
          colors.push(
            parseInt(parts[3]) / 255,
            parseInt(parts[4]) / 255,
            parseInt(parts[5]) / 255
          );
        } else {
          colors.push(0.8, 0.8, 0.8); // Default gray color
        }
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
    
    return geometry;
  }
}
