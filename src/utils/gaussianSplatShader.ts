
import * as THREE from 'three';

export const gaussianSplatVertexShader = `
  attribute vec3 scale;
  attribute float opacity;
  attribute vec4 rotation;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  
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
    vColor = color;
    vOpacity = opacity;
    
    // Transform position to view space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Calculate the splat size based on scale and distance
    vec3 scaledSize = scale * 0.1; // Adjust multiplier for appropriate size
    float splatSize = max(scaledSize.x, max(scaledSize.y, scaledSize.z));
    
    // Apply distance-based scaling
    float distanceScale = 1.0 / length(mvPosition.xyz);
    splatSize *= distanceScale * 100.0; // Adjust for better visibility
    
    // Clamp size to reasonable bounds
    splatSize = clamp(splatSize, 2.0, 50.0);
    
    // Set vertex UV coordinates for the quad
    vUv = uv;
    
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = splatSize;
  }
`;

export const gaussianSplatFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying vec2 vUv;
  
  void main() {
    // Calculate distance from center of the point
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // Create a smooth Gaussian falloff
    float gaussian = exp(-dist * dist * 8.0); // Adjust falloff rate
    
    // Discard pixels outside the splat radius
    if (gaussian < 0.01) discard;
    
    // Apply color and opacity with Gaussian falloff
    vec3 finalColor = vColor;
    float finalOpacity = vOpacity * gaussian;
    
    gl_FragColor = vec4(finalColor, finalOpacity);
  }
`;

export class GaussianSplatMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: gaussianSplatVertexShader,
      fragmentShader: gaussianSplatFragmentShader,
      transparent: true,
      alphaTest: 0.01,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: true,
      vertexColors: true,
    });
  }
}
