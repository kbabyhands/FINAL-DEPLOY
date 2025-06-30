
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
    
    if (!text || text.trim().length === 0) {
      throw new Error('PLY file is empty or corrupted');
    }
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('PLY file contains no valid lines');
    }
    
    // Check if it's a valid PLY file
    if (!lines[0].trim().toLowerCase().startsWith('ply')) {
      throw new Error('Invalid PLY file format - missing PLY header');
    }
    
    let headerEndIndex = 0;
    let vertexCount = 0;
    let faceCount = 0;
    
    // Parse header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      if (line === 'end_header') {
        headerEndIndex = i + 1;
        break;
      }
      if (line.startsWith('element vertex')) {
        const parts = line.split(' ');
        if (parts.length >= 3) {
          vertexCount = parseInt(parts[2]);
        }
      }
      if (line.startsWith('element face')) {
        const parts = line.split(' ');
        if (parts.length >= 3) {
          faceCount = parseInt(parts[2]);
        }
      }
    }

    if (headerEndIndex === 0) {
      throw new Error('PLY file missing end_header marker');
    }

    if (vertexCount === 0) {
      throw new Error('PLY file contains no vertices');
    }

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Parse vertices
    const vertexEndIndex = headerEndIndex + vertexCount;
    for (let i = headerEndIndex; i < vertexEndIndex && i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      const values = line.split(/\s+/).map(val => parseFloat(val)).filter(val => !isNaN(val));
      
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

    // Parse faces if they exist
    if (faceCount > 0) {
      const faceEndIndex = vertexEndIndex + faceCount;
      for (let i = vertexEndIndex; i < faceEndIndex && i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        
        const values = line.split(/\s+/).map(val => parseInt(val)).filter(val => !isNaN(val));
        
        if (values.length >= 4 && values[0] === 3) {
          // Triangular face
          indices.push(values[1], values[2], values[3]);
        }
      }
    }

    if (vertices.length === 0) {
      throw new Error('No valid vertex data found in PLY file');
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    if (colors.length > 0) {
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    if (indices.length > 0) {
      geometry.setIndex(indices);
    }
    
    geometry.computeVertexNormals();
    
    return geometry;
  }
}
