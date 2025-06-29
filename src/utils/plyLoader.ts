
import * as THREE from 'three';

export class PLYLoader {
  load(url: string): Promise<THREE.BufferGeometry> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          try {
            const geometry = this.parse(buffer);
            resolve(geometry);
          } catch (error) {
            reject(error);
          }
        })
        .catch(reject);
    });
  }

  private parse(buffer: ArrayBuffer): THREE.BufferGeometry {
    const text = new TextDecoder().decode(buffer);
    const lines = text.split('\n');
    
    let headerEndIndex = 0;
    let vertexCount = 0;
    let faceCount = 0;
    
    // Parse header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === 'end_header') {
        headerEndIndex = i + 1;
        break;
      }
      if (line.startsWith('element vertex')) {
        vertexCount = parseInt(line.split(' ')[2]);
      }
      if (line.startsWith('element face')) {
        faceCount = parseInt(line.split(' ')[2]);
      }
    }

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Parse vertices
    for (let i = headerEndIndex; i < headerEndIndex + vertexCount; i++) {
      const values = lines[i].trim().split(/\s+/).map(Number);
      if (values.length >= 3) {
        vertices.push(values[0], values[1], values[2]);
        
        // Handle colors if present (RGB values usually at positions 3, 4, 5)
        if (values.length >= 6) {
          colors.push(values[3] / 255, values[4] / 255, values[5] / 255);
        } else {
          colors.push(0.7, 0.7, 0.7); // Default gray color
        }
      }
    }

    // Parse faces
    for (let i = headerEndIndex + vertexCount; i < headerEndIndex + vertexCount + faceCount; i++) {
      const values = lines[i].trim().split(/\s+/).map(Number);
      if (values.length >= 4 && values[0] === 3) {
        indices.push(values[1], values[2], values[3]);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    if (indices.length > 0) {
      geometry.setIndex(indices);
    }
    
    geometry.computeVertexNormals();
    
    return geometry;
  }
}
