// SparkJS Dynamic Loader Service
// Handles lazy loading, caching, and fallbacks for SparkJS

interface SparkJSModules {
  THREE: typeof import('three');
  SplatMesh: typeof import('@sparkjsdev/spark').SplatMesh;
  OrbitControls: typeof import('three-stdlib').OrbitControls;
}

interface LoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error?: string;
  loadingStep: string;
}

interface BrowserCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  hasESModules: boolean;
  hasIntersectionObserver: boolean;
  isMobile: boolean;
  isLowEndDevice: boolean;
}

class SparkJSLoader {
  private modules: SparkJSModules | null = null;
  private loadingPromise: Promise<SparkJSModules> | null = null;
  private loadingState: LoadingState = {
    isLoading: false,
    isLoaded: false,
    hasError: false,
    loadingStep: ''
  };
  private capabilities: BrowserCapabilities | null = null;
  private observers: Set<(state: LoadingState) => void> = new Set();

  constructor() {
    this.detectCapabilities();
  }

  // Detect browser capabilities
  private detectCapabilities(): void {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl2 = canvas.getContext('webgl2');
    
    // Check for low-end device indicators
    const navigator = window.navigator as any;
    const isLowEndDevice = (
      navigator.hardwareConcurrency <= 4 ||
      navigator.deviceMemory <= 4 ||
      /Android.*4\.|iPhone.*OS [1-9]_/.test(navigator.userAgent)
    );

    this.capabilities = {
      hasWebGL: !!gl,
      hasWebGL2: !!gl2,
      hasESModules: 'noModule' in HTMLScriptElement.prototype,
      hasIntersectionObserver: 'IntersectionObserver' in window,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isLowEndDevice
    };

    canvas.remove();
  }

  // Get browser capabilities
  public getCapabilities(): BrowserCapabilities {
    if (!this.capabilities) {
      this.detectCapabilities();
    }
    return this.capabilities!;
  }

  // Check if SparkJS is supported
  public isSupported(): boolean {
    const caps = this.getCapabilities();
    return caps.hasWebGL && caps.hasESModules;
  }

  // Subscribe to loading state changes
  public subscribe(observer: (state: LoadingState) => void): () => void {
    this.observers.add(observer);
    // Immediately notify with current state
    observer(this.loadingState);
    
    return () => {
      this.observers.delete(observer);
    };
  }

  // Notify all observers
  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.loadingState));
  }

  // Update loading state
  private updateLoadingState(updates: Partial<LoadingState>): void {
    this.loadingState = { ...this.loadingState, ...updates };
    this.notifyObservers();
  }

  // Preload modules with resource hints
  public preloadModules(): void {
    if (!this.isSupported()) return;

    // Add preload hints to document head
    const preloadHints = [
      { href: '/node_modules/three/build/three.module.js', as: 'script' },
      { href: '/node_modules/@sparkjsdev/spark/dist/spark.module.js', as: 'script' },
      { href: '/node_modules/three-stdlib/controls/OrbitControls.js', as: 'script' }
    ];

    preloadHints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = hint.href;
      link.as = hint.as;
      document.head.appendChild(link);
    });
  }

  // Load SparkJS modules dynamically
  public async loadModules(): Promise<SparkJSModules> {
    // Return cached modules if already loaded
    if (this.modules) {
      return this.modules;
    }

    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Check if browser supports SparkJS
    if (!this.isSupported()) {
      const error = 'Browser does not support SparkJS requirements (WebGL + ES Modules)';
      this.updateLoadingState({ hasError: true, error });
      throw new Error(error);
    }

    // Start loading
    this.updateLoadingState({ isLoading: true, loadingStep: 'Checking browser compatibility...' });

    this.loadingPromise = this.performLoad();
    
    try {
      const modules = await this.loadingPromise;
      this.modules = modules;
      this.updateLoadingState({ 
        isLoading: false, 
        isLoaded: true, 
        loadingStep: 'Complete!' 
      });
      return modules;
    } catch (error) {
      this.updateLoadingState({ 
        isLoading: false, 
        hasError: true, 
        error: error.message 
      });
      throw error;
    }
  }

  // Perform the actual module loading
  private async performLoad(): Promise<SparkJSModules> {
    try {
      this.updateLoadingState({ loadingStep: 'Loading Three.js...' });
      
      // Load modules in parallel for better performance
      const [THREE, sparkModule, threeStdlibModule] = await Promise.all([
        import('three'),
        import('@sparkjsdev/spark'),
        import('three-stdlib')
      ]);

      this.updateLoadingState({ loadingStep: 'Initializing modules...' });

      // Verify modules loaded correctly
      if (!THREE.Scene || !sparkModule.SplatMesh || !threeStdlibModule.OrbitControls) {
        throw new Error('Failed to load required SparkJS modules');
      }

      this.updateLoadingState({ loadingStep: 'Modules loaded successfully!' });

      return {
        THREE,
        SplatMesh: sparkModule.SplatMesh,
        OrbitControls: threeStdlibModule.OrbitControls
      };
    } catch (error) {
      console.error('SparkJS loading failed:', error);
      throw new Error(`Failed to load SparkJS modules: ${error.message}`);
    }
  }

  // Get current loading state
  public getLoadingState(): LoadingState {
    return this.loadingState;
  }

  // Reset loader state
  public reset(): void {
    this.modules = null;
    this.loadingPromise = null;
    this.loadingState = {
      isLoading: false,
      isLoaded: false,
      hasError: false,
      loadingStep: ''
    };
    this.notifyObservers();
  }

  // Performance monitoring
  public getPerformanceMetrics(): Record<string, number> {
    return {
      loadTime: performance.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      renderTime: 0 // Will be updated by the viewer
    };
  }
}

// Export singleton instance
export const sparkJSLoader = new SparkJSLoader();
export type { SparkJSModules, LoadingState, BrowserCapabilities };