// Lazy-loaded SparkJS component with progressive enhancement
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sparkJSLoader, LoadingState, BrowserCapabilities } from '../services/sparkjs-loader';

interface LazySparkJSProps {
  splatUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  autoRotate?: boolean;
  enableControls?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  fallbackComponent?: React.ComponentType<any>;
}

// Fallback component for unsupported browsers
const DefaultFallback: React.FC<{ width: number; height: number; className: string }> = ({ 
  width, 
  height, 
  className 
}) => (
  <div 
    className={`flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-gray-700 ${className}`}
    style={{ width, height }}
  >
    <div className="text-center p-4">
      <div className="text-4xl mb-4">🍽️</div>
      <h3 className="text-white text-lg font-semibold mb-2">3D Menu Preview</h3>
      <p className="text-gray-400 text-sm">
        Experience our interactive 3D menu on a supported browser
      </p>
    </div>
  </div>
);

// Loading skeleton component
const LoadingSkeleton: React.FC<{ width: number; height: number; className: string; loadingStep: string }> = ({ 
  width, 
  height, 
  className, 
  loadingStep 
}) => (
  <div 
    className={`flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-gray-700 ${className}`}
    style={{ width, height }}
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
      <p className="text-gray-400 text-sm">Loading 3D Experience...</p>
      {loadingStep && (
        <p className="text-gray-500 text-xs mt-1">{loadingStep}</p>
      )}
    </div>
  </div>
);

// Error fallback component
const ErrorFallback: React.FC<{ width: number; height: number; className: string; error: string }> = ({ 
  width, 
  height, 
  className, 
  error 
}) => (
  <div 
    className={`flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-gray-700 ${className}`}
    style={{ width, height }}
  >
    <div className="text-center p-4">
      <div className="text-yellow-400 text-lg mb-2">⚠️</div>
      <p className="text-gray-400 text-sm mb-2">3D Viewer Unavailable</p>
      <p className="text-gray-500 text-xs">{error}</p>
    </div>
  </div>
);

const LazySparkJS: React.FC<LazySparkJSProps> = ({ 
  splatUrl, 
  width = 800, 
  height = 400, 
  className = '',
  autoRotate = true,
  enableControls = true,
  onLoad,
  onError,
  fallbackComponent: FallbackComponent = DefaultFallback
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ 
    isLoading: false, 
    isLoaded: false, 
    hasError: false, 
    loadingStep: '' 
  });
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [sparkJSComponent, setSparkJSComponent] = useState<React.ComponentType<any> | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  // Initialize capabilities and intersection observer
  useEffect(() => {
    const caps = sparkJSLoader.getCapabilities();
    setCapabilities(caps);

    // Set up intersection observer for lazy loading
    if (caps.hasIntersectionObserver && containerRef.current) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              // Stop observing once we've detected intersection
              if (intersectionObserverRef.current) {
                intersectionObserverRef.current.disconnect();
              }
            }
          });
        },
        { 
          rootMargin: '50px', // Start loading when 50px away from viewport
          threshold: 0.1 
        }
      );

      intersectionObserverRef.current.observe(containerRef.current);
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsIntersecting(true);
    }

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);

  // Subscribe to loading state changes
  useEffect(() => {
    const unsubscribe = sparkJSLoader.subscribe(setLoadingState);
    return unsubscribe;
  }, []);

  // Load SparkJS when component becomes visible
  useEffect(() => {
    if (!isIntersecting || !capabilities?.hasWebGL || sparkJSComponent) return;

    const loadSparkJS = async () => {
      try {
        // First, preload modules
        sparkJSLoader.preloadModules();
        
        // Then load the actual SparkJS component
        const { default: OptimizedSplatViewer } = await import('./OptimizedSplatViewer');
        setSparkJSComponent(() => OptimizedSplatViewer);
        
        onLoad?.();
      } catch (error) {
        console.error('Failed to load SparkJS component:', error);
        onError?.(error.message);
      }
    };

    loadSparkJS();
  }, [isIntersecting, capabilities, sparkJSComponent, onLoad, onError]);

  // Handle unsupported browser
  if (!capabilities?.hasWebGL) {
    return (
      <FallbackComponent 
        width={width} 
        height={height} 
        className={className}
        splatUrl={splatUrl}
        autoRotate={autoRotate}
        enableControls={enableControls}
      />
    );
  }

  // Handle loading state
  if (loadingState.isLoading) {
    return (
      <LoadingSkeleton 
        width={width} 
        height={height} 
        className={className}
        loadingStep={loadingState.loadingStep}
      />
    );
  }

  // Handle error state
  if (loadingState.hasError) {
    return (
      <ErrorFallback 
        width={width} 
        height={height} 
        className={className}
        error={loadingState.error || 'Unknown error'}
      />
    );
  }

  // Render SparkJS component if loaded
  if (sparkJSComponent) {
    const SparkJSComponent = sparkJSComponent;
    return (
      <SparkJSComponent
        splatUrl={splatUrl}
        width={width}
        height={height}
        className={className}
        autoRotate={autoRotate}
        enableControls={enableControls}
      />
    );
  }

  // Show skeleton while waiting for intersection
  return (
    <div ref={containerRef}>
      <LoadingSkeleton 
        width={width} 
        height={height} 
        className={className}
        loadingStep="Preparing 3D viewer..."
      />
    </div>
  );
};

export default LazySparkJS;