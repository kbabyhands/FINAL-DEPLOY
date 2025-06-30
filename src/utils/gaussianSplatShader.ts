
import * as THREE from 'three';

export const gaussianSplatVertexShader = `
  // Instance attributes
  attribute vec3 splatPosition;
  attribute vec3 splatColor;
  attribute vec3 splatScale;
  attribute vec4 splatRotation;
  attribute float splatOpacity;
  
  // Vertex attributes for quad
  attribute vec2 quadOffset;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  varying float vRadius;
  
  uniform vec2 screenSize;
  
  mat3 quaternionToMatrix(vec4 q) {
    float w = q.w, x = q.x, y = q.y, z = q.z;
    return mat3(
      1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y + w * z), 2.0 * (x * z - w * y),
      2.0 * (x * y - w * z), 1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z + w * x),
      2.0 * (x * z + w * y), 2.0 * (y * z - w * x), 1.0 - 2.0 * (x * x + y * y)
    );
  }
  
  void main() {
    vColor = splatColor;
    vOpacity = splatOpacity;
    vUv = quadOffset;
    
    // Transform to view space
    vec4 viewPos = modelViewMatrix * vec4(splatPosition, 1.0);
    
    // Create covariance in 3D
    mat3 R = quaternionToMatrix(splatRotation);
    mat3 S = mat3(splatScale.x, 0.0, 0.0, 0.0, splatScale.y, 0.0, 0.0, 0.0, splatScale.z);
    mat3 M = R * S;
    mat3 Sigma = M * transpose(M);
    
    // Transform to view space
    mat3 J = mat3(modelViewMatrix);
    mat3 W = transpose(J) * Sigma * J;
    
    // Project to 2D
    mat2 Cov2D = mat2(W[0][0], W[0][1], W[1][0], W[1][1]);
    
    // Add regularization
    Cov2D[0][0] += 0.3;
    Cov2D[1][1] += 0.3;
    
    // Compute eigenvalues for size
    float a = Cov2D[0][0];
    float b = Cov2D[0][1];
    float c = Cov2D[1][1];
    
    float det = a * c - b * b;
    float trace = a + c;
    float discriminant = trace * trace - 4.0 * det;
    
    float lambda1 = 0.5 * (trace + sqrt(max(0.1, discriminant)));
    float lambda2 = 0.5 * (trace - sqrt(max(0.1, discriminant)));
    
    float radius = 3.0 * sqrt(max(lambda1, lambda2));
    vRadius = max(radius, 4.0);
    
    // Project center
    vec4 clipPos = projectionMatrix * viewPos;
    
    // Billboard in screen space
    vec2 screenOffset = quadOffset * vRadius / screenSize * clipPos.w;
    
    gl_Position = clipPos;
    gl_Position.xy += screenOffset;
  }
`;

export const gaussianSplatFragmentShader = `
  precision highp float;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  varying float vRadius;
  
  void main() {
    float d = dot(vUv, vUv);
    
    if (d > 1.0) discard;
    
    float gaussian = exp(-0.5 * d);
    float alpha = vOpacity * gaussian;
    
    if (alpha < 0.02) discard;
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export class GaussianSplatMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: gaussianSplatVertexShader,
      fragmentShader: gaussianSplatFragmentShader,
      uniforms: {
        screenSize: { value: new THREE.Vector2(1920, 1080) }
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide
    });
  }
  
  updateScreenSize(width: number, height: number) {
    this.uniforms.screenSize.value.set(width, height);
  }
}

export class SplatInstancedGeometry extends THREE.InstancedBufferGeometry {
  constructor(count: number) {
    super();
    
    // Simple quad
    const vertices = new Float32Array([
      -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0
    ]);
    
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    
    const offsets = new Float32Array([
      -1, -1, 1, -1, 1, 1, -1, 1
    ]);
    
    this.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.setAttribute('quadOffset', new THREE.BufferAttribute(offsets, 2));
    this.setIndex(new THREE.BufferAttribute(indices, 1));
    
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
