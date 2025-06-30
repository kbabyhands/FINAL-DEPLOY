
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
  varying vec2 vUv;
  varying vec3 vCenter;
  varying mat2 vCov2D;
  
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
    vUv = quadOffset;
    
    // Transform splat center to view space
    vec4 center4 = modelViewMatrix * vec4(splatPosition, 1.0);
    vec3 center = center4.xyz / center4.w;
    vCenter = center;
    
    // Create rotation matrix from quaternion
    mat3 R = quaternionToMatrix(splatRotation);
    
    // Create scale matrix
    mat3 S = mat3(
      splatScale.x, 0.0, 0.0,
      0.0, splatScale.y, 0.0,
      0.0, 0.0, splatScale.z
    );
    
    // Compute 3D covariance: Cov3D = R * S * S^T * R^T
    mat3 M = R * S;
    mat3 Cov3D = M * transpose(M);
    
    // Project to 2D screen space
    // Extract view matrix (upper 3x3 of modelViewMatrix)
    mat3 W = mat3(
      modelViewMatrix[0].xyz,
      modelViewMatrix[1].xyz,
      modelViewMatrix[2].xyz
    );
    
    // Transform covariance to view space
    mat3 Cov = transpose(W) * Cov3D * W;
    
    // Project to 2D (take upper-left 2x2 submatrix)
    mat2 Cov2D = mat2(
      Cov[0][0], Cov[0][1],
      Cov[1][0], Cov[1][1]
    );
    
    // Add a small epsilon to diagonal for numerical stability
    Cov2D[0][0] += 0.3;
    Cov2D[1][1] += 0.3;
    
    vCov2D = Cov2D;
    
    // Compute eigenvalues for ellipse size
    float a = Cov2D[0][0];
    float b = Cov2D[0][1];
    float c = Cov2D[1][1];
    
    float mid = 0.5 * (a + c);
    float det = a * c - b * b;
    float discriminant = mid * mid - det;
    
    float lambda1 = mid + sqrt(max(0.1, discriminant));
    float lambda2 = mid - sqrt(max(0.1, discriminant));
    
    // 3-sigma confidence interval
    float radius1 = 3.0 * sqrt(lambda1);
    float radius2 = 3.0 * sqrt(lambda2);
    
    // Ensure minimum size for visibility
    radius1 = max(radius1, 2.0);
    radius2 = max(radius2, 2.0);
    
    // Create billboard quad
    vec2 offset = quadOffset * vec2(radius1, radius2);
    
    // Project center to screen space
    vec4 projCenter = projectionMatrix * vec4(center, 1.0);
    
    // Add offset in screen space
    vec4 projQuad = projCenter;
    projQuad.xy += offset * projCenter.w * vec2(1.0 / 800.0, 1.0 / 600.0); // Approximate screen size scaling
    
    gl_Position = projQuad;
  }
`;

export const gaussianSplatFragmentShader = `
  precision highp float;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  varying vec3 vCenter;
  varying mat2 vCov2D;
  
  void main() {
    // Compute inverse of covariance matrix
    float det = vCov2D[0][0] * vCov2D[1][1] - vCov2D[0][1] * vCov2D[1][0];
    
    if (det <= 0.0) {
      discard;
    }
    
    mat2 invCov = mat2(
      vCov2D[1][1], -vCov2D[0][1],
      -vCov2D[1][0], vCov2D[0][0]
    ) / det;
    
    // Compute Gaussian exponent: exp(-0.5 * uv^T * invCov * uv)
    vec2 d = vUv;
    float exponent = -0.5 * dot(d, invCov * d);
    
    // Apply 3-sigma cutoff
    if (exponent < -4.5) discard; // exp(-4.5) ≈ 0.01
    
    float gaussian = exp(exponent);
    
    // Apply opacity
    float alpha = vOpacity * gaussian;
    
    // Discard nearly transparent pixels
    if (alpha < 0.01) discard;
    
    // Enhanced color output with gamma correction
    vec3 color = pow(vColor, vec3(2.2)); // Convert to linear space
    color = pow(color, vec3(1.0 / 2.2)); // Convert back to sRGB
    
    gl_FragColor = vec4(color, alpha);
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
      // Add proper blending for Gaussian splats
      blendSrc: THREE.OneMinusDstAlphaFactor,
      blendDst: THREE.OneFactor,
      blendEquation: THREE.AddEquation,
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
