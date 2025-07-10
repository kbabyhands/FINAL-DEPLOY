// Performance monitoring for PlayCanvas homepage
import { useEffect } from 'react';

interface PerformanceMetrics {
  ttfb: number; // Time to First Byte
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  playcanvasLoadTime?: number;
  playcanvasRenderTime?: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-input') {
              this.metrics.fid = entry.processingStart - entry.startTime;
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS Observer
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          this.metrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // Navigation timing for TTFB and FCP
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Paint timing for FCP
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        console.warn('Paint observer not supported');
      }
    }
  }

  public recordPlayCanvasLoadTime(loadTime: number) {
    this.metrics.playcanvasLoadTime = loadTime;
  }

  public recordPlayCanvasRenderTime(renderTime: number) {
    this.metrics.playcanvasRenderTime = renderTime;
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public reportMetrics() {
    const metrics = this.getMetrics();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics);
    }

    // Send to analytics service (placeholder)
    this.sendToAnalytics(metrics);
  }

  private sendToAnalytics(metrics: Partial<PerformanceMetrics>) {
    // This would normally send to your analytics service
    // For now, we'll just log the metrics
    console.log('Sending performance metrics to analytics:', metrics);
    
    // Example: Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', {
        event_category: 'PlayCanvas',
        ttfb: metrics.ttfb,
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        playcanvas_load_time: metrics.playcanvasLoadTime,
        playcanvas_render_time: metrics.playcanvasRenderTime
      });
    }
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Report metrics after initial load
    const reportTimeout = setTimeout(() => {
      performanceMonitor.reportMetrics();
    }, 5000); // Report after 5 seconds

    // Report on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        performanceMonitor.reportMetrics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(reportTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return performanceMonitor;
};

// Utility function to measure Time to Interactive (TTI)
export const measureTimeToInteractive = (): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const checkInteractive = () => {
      // Check if the page is interactive
      if (document.readyState === 'complete') {
        const tti = performance.now() - startTime;
        resolve(tti);
      } else {
        requestAnimationFrame(checkInteractive);
      }
    };
    
    checkInteractive();
  });
};

// Utility function to measure PlayCanvas specific metrics
export const measurePlayCanvasPerformance = async (
  loadStartTime: number,
  renderStartTime: number
): Promise<{ loadTime: number; renderTime: number }> => {
  const loadTime = performance.now() - loadStartTime;
  const renderTime = performance.now() - renderStartTime;
  
  performanceMonitor.recordPlayCanvasLoadTime(loadTime);
  performanceMonitor.recordPlayCanvasRenderTime(renderTime);
  
  return { loadTime, renderTime };
};