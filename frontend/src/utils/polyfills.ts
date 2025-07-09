// Browser compatibility polyfills for SparkJS
// This file ensures older browsers can still use the homepage

// Polyfill for IntersectionObserver
if (!window.IntersectionObserver) {
  // Simple polyfill that immediately triggers intersection
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      // Immediately call the callback to trigger lazy loading
      setTimeout(() => {
        callback([{
          isIntersecting: true,
          target: document.body,
          intersectionRatio: 1,
          boundingClientRect: document.body.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now()
        }] as IntersectionObserverEntry[], this);
      }, 0);
    }
    
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Polyfill for requestAnimationFrame
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return window.setTimeout(callback, 1000 / 60);
  };
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id: number): void => {
    window.clearTimeout(id);
  };
}

// Polyfill for performance.now()
if (!window.performance || !window.performance.now) {
  window.performance = {
    ...window.performance,
    now: () => Date.now()
  };
}

// Polyfill for Promise.allSettled (for older browsers)
if (!Promise.allSettled) {
  Promise.allSettled = function<T>(promises: Promise<T>[]) {
    return Promise.all(promises.map(promise => 
      promise
        .then(value => ({ status: 'fulfilled' as const, value }))
        .catch(reason => ({ status: 'rejected' as const, reason }))
    ));
  };
}

// ES6 features polyfill check
export const checkES6Support = (): boolean => {
  try {
    // Test for basic ES6 features
    eval('const test = (x) => x + 1; let y = `template ${test(1)}`');
    return true;
  } catch (e) {
    return false;
  }
};

// WebGL support check
export const checkWebGLSupport = (): { webgl: boolean; webgl2: boolean } => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const gl2 = canvas.getContext('webgl2');
  
  canvas.remove();
  
  return {
    webgl: !!gl,
    webgl2: !!gl2
  };
};

// Device capability detection
export const getDeviceCapabilities = () => {
  const navigator = window.navigator as any;
  
  return {
    // Memory
    deviceMemory: navigator.deviceMemory || 4,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    
    // Network
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
    
    // Touch capabilities
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Platform
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    
    // Viewport
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    }
  };
};

// Feature detection for modern JavaScript features
export const hasModernFeatures = (): boolean => {
  const features = [
    'Promise',
    'fetch',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Symbol',
    'Proxy'
  ];
  
  return features.every(feature => feature in window);
};

// Initialize polyfills
export const initializePolyfills = (): void => {
  // Log browser capabilities
  const capabilities = getDeviceCapabilities();
  const webglSupport = checkWebGLSupport();
  const es6Support = checkES6Support();
  const modernFeatures = hasModernFeatures();
  
  console.log('Browser Capabilities:', {
    webgl: webglSupport.webgl,
    webgl2: webglSupport.webgl2,
    es6: es6Support,
    modernFeatures,
    memory: capabilities.deviceMemory,
    cores: capabilities.hardwareConcurrency,
    touch: capabilities.touchSupport,
    viewport: capabilities.viewport
  });
  
  // Add body classes for CSS feature detection
  document.body.classList.add(
    webglSupport.webgl ? 'webgl-supported' : 'webgl-not-supported',
    webglSupport.webgl2 ? 'webgl2-supported' : 'webgl2-not-supported',
    es6Support ? 'es6-supported' : 'es6-not-supported',
    modernFeatures ? 'modern-features' : 'legacy-features',
    capabilities.touchSupport ? 'touch-device' : 'no-touch'
  );
};