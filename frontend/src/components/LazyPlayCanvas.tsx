// Lazy-loaded PlayCanvas component with progressive enhancement for homepage
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayCanvasPreloader } from '@/hooks/usePlayCanvasPreloader';

interface LazyPlayCanvasProps {
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

// Browser capabilities detection
interface BrowserCapabilities {
  hasWebGL: boolean;
  hasIntersectionObserver: boolean;
  isMobile: boolean;
  isLowEndDevice: boolean;
}

const detectCapabilities = (): BrowserCapabilities => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  // Check for low-end device indicators
  const navigator = window.navigator as any;
  const isLowEndDevice = (
    navigator.hardwareConcurrency <= 4 ||
    navigator.deviceMemory <= 4 ||
    /Android.*4\.|iPhone.*OS [1-9]_/.test(navigator.userAgent)
  );

  const capabilities = {
    hasWebGL: !!gl,
    hasIntersectionObserver: 'IntersectionObserver' in window,
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isLowEndDevice
  };

  canvas.remove();
  return capabilities;
};

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

const LazyPlayCanvas: React.FC<LazyPlayCanvasProps> = ({ 
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
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [playCanvasComponent, setPlayCanvasComponent] = useState<React.ComponentType<any> | null>(null);
  const [loadingStep, setLoadingStep] = useState('Preparing...');
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  // Initialize capabilities and intersection observer
  useEffect(() => {
    const caps = detectCapabilities();
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

  // Load PlayCanvas when component becomes visible
  useEffect(() => {
    if (!isIntersecting || !capabilities?.hasWebGL || playCanvasComponent) return;

    const loadPlayCanvas = async () => {
      try {
        setLoadingStep('Loading 3D engine...');
        
        // Dynamic import of the optimized PlayCanvas component
        const { default: OptimizedPlayCanvasViewer } = await import('./OptimizedPlayCanvasViewer');
        setPlayCanvasComponent(() => OptimizedPlayCanvasViewer);
        
        setLoadingStep('3D engine ready!');
        onLoad?.();
      } catch (error) {
        console.error('Failed to load PlayCanvas component:', error);
        setError(error.message);
        onError?.(error.message);
      }
    };

    loadPlayCanvas();
  }, [isIntersecting, capabilities, playCanvasComponent, onLoad, onError]);

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

  // Handle error state
  if (error) {
    return (
      <ErrorFallback 
        width={width} 
        height={height} 
        className={className}
        error={error}
      />
    );
  }

  // Render PlayCanvas component if loaded
  if (playCanvasComponent) {
    const PlayCanvasComponent = playCanvasComponent;
    return (
      <PlayCanvasComponent
        splatUrl={splatUrl}
        width={width}
        height={height}
        className={className}
        autoRotate={autoRotate}
        enableControls={enableControls}
        performanceMode={capabilities.isLowEndDevice}
        lazyLoad={false} // Already handled lazy loading at this level
      />
    );
  }

  // Show skeleton while waiting for intersection or loading
  return (
    <div ref={containerRef}>
      <LoadingSkeleton 
        width={width} 
        height={height} 
        className={className}
        loadingStep={loadingStep}
      />
    </div>
  );
};

export default LazyPlayCanvas;