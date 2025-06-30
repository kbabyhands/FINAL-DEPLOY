
import * as THREE from 'three';

export const gaussianSplatVertexShader = `
  // Instance attributes (per splat)
  attribute vec3 splatPosition;
  attribute vec3 splatColor;
  attribute vec3 splatScale;
  attribute vec4 splatRotation;
  attribute float splatOpacity;
  
  // Vertex attributes (per quad vertex)
  attribute vec2 quadOffset; // (-1,-1), (1,-1), (1,1), (-1,1)
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vQuadOffset;
  varying float vRadius;
  
  // Convert quaternion to rotation matrix
  mat3 quaternionToMatrix(vec4 q) {
    float x = q.x, y = q.y, z = q.z, w = q.w;
    float x2 = x + x, y2 = y + y, z2 = z + z;
    float xx = x * x2, xy = x * y2, xz = x * z2;
    float yy = y * y2, yz = y * z2, zz = z * z2;
    float wx = w * x2, wy = w * y2, wz = w * z2;
    
    return mat3(
      1.0 - (yy + zz), xy + wz, xz - wy,
      xy - wz, 1.0 - (xx + zz), yz + wx,
      xz + wy, yz - wx, 1.0 - (xx + yy)
    );
  }
  
  void main() {
    vColor = splatColor;
    vOpacity = splatOpacity;
    vQuadOffset = quadOffset;
    
    // Transform splat center to view space
    vec4 viewCenter = modelViewMatrix * vec4(splatPosition, 1.0);
    
    // Calculate the maximum extent of the splat
    float maxScale = max(splatScale.x, max(splatScale.y, splatScale.z));
    vRadius = maxScale;
    
    // Create rotation matrix from quaternion
    mat3 rotMatrix = quaternionToMatrix(splatRotation);
    
    // Create a 3x3 covariance matrix from scale and rotation
    mat3 scaleMatrix = mat3(
      splatScale.x, 0.0, 0.0,
      0.0, splatScale.y, 0.0,
      0.0, 0.0, splatScale.z
    );
    
    mat3 M = rotMatrix * scaleMatrix;
    mat3 Sigma = M * transpose(M);
    
    // Project the 3D covariance to 2D screen space
    // This is a simplified projection - in practice, you'd use the full Jacobian
    mat3 viewMatrix = mat3(modelViewMatrix);
    mat3 covView = viewMatrix * Sigma * transpose(viewMatrix);
    
    // Extract 2D covariance matrix (top-left 2x2)
    mat2 cov2D = mat2(covView[0][0], covView[0][1], covView[1][0], covView[1][1]);
    
    // Calculate eigenvalues for proper billboard sizing
    float a = cov2D[0][0];
    float b = cov2D[0][1];
    float c = cov2D[1][1];
    float discriminant = sqrt((a - c) * (a - c) + 4.0 * b * b);
    float lambda1 = 0.5 * (a + c + discriminant);
    float lambda2 = 0.5 * (a + c - discriminant);
    
    // Calculate the size of the billboard based on eigenvalues
    float radius1 = sqrt(max(0.0, lambda1)) * 3.0; // 3-sigma extent
    float radius2 = sqrt(max(0.0, lambda2)) * 3.0;
    
    // Ensure minimum size for visibility
    radius1 = max(radius1, 0.01);
    radius2 = max(radius2, 0.01);
    
    // Calculate eigenvectors for orientation
    vec2 eigenvec1, eigenvec2;
    if (abs(b) > 0.001) {
      eigenvec1 = normalize(vec2(lambda1 - c, b));
      eigenvec2 = normalize(vec2(-b, lambda1 - a));
    } else if (a >= c) {
      eigenvec1 = vec2(1.0, 0.0);
      eigenvec2 = vec2(0.0, 1.0);
    } else {
      eigenvec1 = vec2(0.0, 1.0);
      eigenvec2 = vec2(1.0, 0.0);
    }
    
    // Create the billboard quad
    vec2 quadPos = quadOffset.x * radius1 * eigenvec1 + quadOffset.y * radius2 * eigenvec2;
    
    // Project to screen space
    vec4 projCenter = projectionMatrix * viewCenter;
    vec4 projQuad = projCenter;
    projQuad.xy += quadPos * projCenter.w;
    
    gl_Position = projQuad;
  }
`;

export const gaussianSplatFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vQuadOffset;
  varying float vRadius;
  
  void main() {
    // Calculate distance from center of the quad
    float dist = length(vQuadOffset);
    
    // Gaussian evaluation: exp(-0.5 * x^T * Sigma^-1 * x)
    // For a circular approximation, we use: exp(-0.5 * dist^2)
    float gaussian = exp(-0.5 * dist * dist);
    
    // Apply 3-sigma cutoff for proper Gaussian extent
    if (dist > 3.0) discard;
    
    // Calculate final opacity with Gaussian falloff
    float alpha = vOpacity * gaussian;
    
    // Discard nearly transparent pixels to improve performance
    if (alpha < 0.001) discard;
    
    // Output final color
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export class GaussianSplatMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: gaussianSplatVertexShader,
      fragmentShader: gaussianSplatFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });
  }
}

// Instanced geometry for efficient rendering of many splats
export class SplatInstancedGeometry extends THREE.InstancedBufferGeometry {
  constructor(count: number) {
    super();
    
    // Create a quad geometry for each splat
    const quadVertices = new Float32Array([
      -1, -1, 0,
      1, -1, 0,
      1, 1, 0,
      -1, 1, 0
    ]);
    
    const quadIndices = new Uint16Array([
      0, 1, 2,
      0, 2, 3
    ]);
    
    const quadOffsets = new Float32Array([
      -1, -1,
      1, -1,
      1, 1,
      -1, 1
    ]);
    
    this.setAttribute('position', new THREE.BufferAttribute(quadVertices, 3));
    this.setAttribute('quadOffset', new THREE.BufferAttribute(quadOffsets, 2));
    this.setIndex(new THREE.BufferAttribute(quadIndices, 1));
    
    // Instance attributes will be set by the renderer
    this.instanceCount = count;
  }
  
  setSplatData(splatData: any) {
    this.setAttribute('splatPosition', new THREE.InstancedBufferAttribute(splatData.positions, 3));
    this.setAttribute('splatColor', new THREE.InstancedBufferAttribute(splatData.colors, 3));
    this.setAttribute('splatScale', new THREE.InstancedBufferAttribute(splatData.scales, 3));
    this.setAttribute('splatRotation', new THREE.InstancedBufferAttribute(splatData.rotations, 4));
    this.setAttribute('splatOpacity', new THREE.InstancedBufferAttribute(splatData.opacities, 1));
  }
}
