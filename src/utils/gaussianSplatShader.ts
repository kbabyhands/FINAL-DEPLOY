import * as THREE from 'three';

export const gaussianSplatVertexShader = `
  // Instance attributes
  attribute vec3 splatPosition;
  attribute vec3 splatColor;
  attribute vec3 splatScale;
  attribute vec4 splatRotation;
  attribute float splatOpacity;
  
  // Vertex attributes for billboard quad
  attribute vec2 quadOffset;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  varying float vRadius;
  
  uniform vec2 screenSize;
  uniform float time;
  uniform float devicePixelRatio;
  uniform vec2 viewportSize;
  
  // Convert quaternion to rotation matrix
  mat3 getRotationMatrix(vec4 q) {
    float w = q.w, x = q.x, y = q.y, z = q.z;
    return mat3(
      1.0 - 2.0 * (y*y + z*z), 2.0 * (x*y + w*z), 2.0 * (x*z - w*y),
      2.0 * (x*y - w*z), 1.0 - 2.0 * (x*x + z*z), 2.0 * (y*z + w*x),
      2.0 * (x*z + w*y), 2.0 * (y*z - w*x), 1.0 - 2.0 * (x*x + y*y)
    );
  }
  
  void main() {
    vColor = splatColor;
    vOpacity = splatOpacity;
    vUv = quadOffset;
    
    // Transform splat position to view space
    vec4 viewPos = modelViewMatrix * vec4(splatPosition, 1.0);
    
    // Calculate splat size in screen space with responsive scaling
    float distance = length(viewPos.xyz);
    float splatSize = max(splatScale.x, max(splatScale.y, splatScale.z));
    
    // Responsive sizing based on screen size and distance
    float screenFactor = min(screenSize.x, screenSize.y) / 800.0; // Normalize to 800px baseline
    float responsiveScale = mix(0.5, 1.0, screenFactor); // Scale down on smaller screens
    
    float screenRadius = (splatSize * 80.0 * responsiveScale) / (distance * devicePixelRatio);
    screenRadius = clamp(screenRadius, 1.5, 30.0); // Adjusted range for better mobile performance
    vRadius = screenRadius;
    
    // Create billboard quad
    vec3 right = normalize(vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]));
    vec3 up = normalize(vec3(modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1]));
    
    // Apply rotation to the billboard
    mat3 rotation = getRotationMatrix(splatRotation);
    vec3 rotatedRight = rotation * right;
    vec3 rotatedUp = rotation * up;
    
    // Responsive offset scaling
    float offsetScale = 0.01 * responsiveScale;
    vec3 offset = (rotatedRight * quadOffset.x + rotatedUp * quadOffset.y) * screenRadius * offsetScale;
    vec4 finalViewPos = viewPos + vec4(offset, 0.0);
    
    gl_Position = projectionMatrix * finalViewPos;
  }
`;

export const gaussianSplatFragmentShader = `
  precision highp float;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  varying float vRadius;
  
  uniform vec2 screenSize;
  uniform float devicePixelRatio;
  
  void main() {
    // Calculate distance from center
    float dist = length(vUv);
    
    // Responsive Gaussian falloff - sharper on high-DPI displays
    float falloffIntensity = mix(3.0, 5.0, min(devicePixelRatio, 2.0));
    float gaussian = exp(-falloffIntensity * dist * dist);
    
    // Adaptive early discard threshold for performance
    float discardThreshold = devicePixelRatio > 1.5 ? 0.005 : 0.01;
    if (gaussian < discardThreshold) discard;
    
    // Apply opacity with responsive brightness
    float alpha = gaussian * vOpacity;
    
    // Screen-size adaptive color enhancement
    float colorBoost = mix(1.1, 1.3, min(screenSize.x / 1920.0, 1.0));
    vec3 color = vColor * (1.0 + 0.2 * gaussian * colorBoost);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export class GaussianSplatMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: gaussianSplatVertexShader,
      fragmentShader: gaussianSplatFragmentShader,
      uniforms: {
        screenSize: { value: new THREE.Vector2(1920, 1080) },
        time: { value: 0.0 },
        devicePixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        viewportSize: { value: new THREE.Vector2(10, 10) }
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
  
  updateTime(time: number) {
    this.uniforms.time.value = time;
  }
  
  updateDevicePixelRatio(ratio: number) {
    this.uniforms.devicePixelRatio.value = Math.min(ratio, 2);
  }
  
  updateViewportSize(width: number, height: number) {
    this.uniforms.viewportSize.value.set(width, height);
  }
}

export class SplatInstancedGeometry extends THREE.InstancedBufferGeometry {
  constructor(count: number) {
    super();
    
    // Create a simple quad
    const vertices = new Float32Array([
      -1, -1, 0,
       1, -1, 0,
       1,  1, 0,
      -1,  1, 0
    ]);
    
    const indices = new Uint16Array([
      0, 1, 2,
      0, 2, 3
    ]);
    
    const uvs = new Float32Array([
      -1, -1,
       1, -1,
       1,  1,
      -1,  1
    ]);
    
    this.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.setAttribute('quadOffset', new THREE.BufferAttribute(uvs, 2));
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
