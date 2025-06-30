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
  varying vec2 vConic;
  varying float vPower;
  
  uniform vec2 screenSize;
  uniform float focalX;
  uniform float focalY;
  
  mat3 quaternionToMatrix(vec4 q) {
    float w = q.w, x = q.x, y = q.y, z = q.z;
    float xx = x * x, yy = y * y, zz = z * z;
    float xy = x * y, xz = x * z, yz = y * z;
    float wx = w * x, wy = w * y, wz = w * z;
    
    return mat3(
      1.0 - 2.0 * (yy + zz), 2.0 * (xy + wz), 2.0 * (xz - wy),
      2.0 * (xy - wz), 1.0 - 2.0 * (xx + zz), 2.0 * (yz + wx),
      2.0 * (xz + wy), 2.0 * (yz - wx), 1.0 - 2.0 * (xx + yy)
    );
  }
  
  void main() {
    vColor = splatColor;
    vOpacity = splatOpacity;
    
    // Transform splat center to view space
    vec4 viewPos = modelViewMatrix * vec4(splatPosition, 1.0);
    float depth = -viewPos.z;
    
    // Create scaling matrix
    mat3 S = mat3(
      splatScale.x, 0.0, 0.0,
      0.0, splatScale.y, 0.0,
      0.0, 0.0, splatScale.z
    );
    
    // Create rotation matrix from quaternion
    mat3 R = quaternionToMatrix(splatRotation);
    
    // Combine rotation and scaling to get covariance
    mat3 RS = R * S;
    mat3 Sigma3D = transpose(RS) * RS;
    
    // Transform to view space
    mat3 modelView3x3 = mat3(modelViewMatrix);
    mat3 Cov3D = modelView3x3 * Sigma3D * transpose(modelView3x3);
    
    // Project to 2D covariance using proper Jacobian
    float focal = focalX;
    float txtz = depth * depth;
    
    mat3 J = mat3(
      focal / depth, 0.0, -(focal * viewPos.x) / txtz,
      0.0, focal / depth, -(focal * viewPos.y) / txtz,
      0.0, 0.0, 0.0
    );
    
    mat3 W = J * Cov3D * transpose(J);
    
    // Add regularization to prevent degenerate cases
    mat2 Cov2D = mat2(
      W[0][0] + 0.3, W[0][1], 
      W[1][0], W[1][1] + 0.3
    );
    
    // Compute eigenvalues for ellipse size
    float det = Cov2D[0][0] * Cov2D[1][1] - Cov2D[0][1] * Cov2D[1][0];
    float trace = Cov2D[0][0] + Cov2D[1][1];
    
    if (det <= 0.0) {
      gl_Position = vec4(0.0, 0.0, -1.0, 1.0); // Cull invalid splats
      return;
    }
    
    float mid = 0.5 * trace;
    float discriminant = max(0.1, mid * mid - det);
    float lambda1 = mid + sqrt(discriminant);
    float lambda2 = mid - sqrt(discriminant);
    
    float radius = ceil(3.0 * sqrt(max(lambda1, lambda2)));
    radius = max(radius, 2.0);
    
    // Compute inverse covariance for fragment shader
    float detInv = 1.0 / det;
    vConic = vec2(Cov2D[1][1] * detInv, -Cov2D[0][1] * detInv);
    vPower = Cov2D[0][0] * detInv;
    
    // Project center to screen
    vec4 clipPos = projectionMatrix * viewPos;
    vec2 ndc = clipPos.xy / clipPos.w;
    vec2 screenPos = (ndc * 0.5 + 0.5) * screenSize;
    
    // Apply billboard offset
    vec2 offset = quadOffset * radius;
    screenPos += offset;
    vUv = quadOffset;
    
    // Convert back to NDC
    vec2 finalNDC = (screenPos / screenSize) * 2.0 - 1.0;
    
    // Preserve depth
    gl_Position = vec4(finalNDC * clipPos.w, clipPos.z, clipPos.w);
  }
`;

export const gaussianSplatFragmentShader = `
  precision highp float;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  varying vec2 vConic;
  varying float vPower;
  
  void main() {
    vec2 d = vUv;
    
    // Compute Gaussian using proper quadratic form
    float power = -0.5 * (vPower * d.x * d.x + 2.0 * vConic.y * d.x * d.y + vConic.x * d.y * d.y);
    
    // Early discard for efficiency
    if (power > 0.0) discard;
    if (power < -4.0) discard; // Prevent underflow
    
    float alpha = exp(power);
    
    // Apply opacity threshold
    if (alpha < 0.01) discard;
    
    alpha *= vOpacity;
    
    // Gamma correction for better color representation
    vec3 color = pow(vColor, vec3(2.2));
    
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export class GaussianSplatMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: gaussianSplatVertexShader,
      fragmentShader: gaussianSplatFragmentShader,
      uniforms: {
        screenSize: { value: new THREE.Vector2(1920, 1080) },
        focalX: { value: 1000.0 },
        focalY: { value: 1000.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending, // Changed to additive for better splat blending
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide
    });
  }
  
  updateScreenSize(width: number, height: number) {
    this.uniforms.screenSize.value.set(width, height);
    // Compute focal length based on field of view and screen size
    const fov = 50 * Math.PI / 180; // 50 degrees in radians
    const focal = (height / 2) / Math.tan(fov / 2);
    this.uniforms.focalX.value = focal;
    this.uniforms.focalY.value = focal;
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
