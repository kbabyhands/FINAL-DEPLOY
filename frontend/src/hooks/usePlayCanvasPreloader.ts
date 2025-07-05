import { useEffect, useRef, useCallback } from 'react';
import * as pc from 'playcanvas';

interface PreloadedModel {
  asset: any;
  timestamp: number;
}

interface PreloadedInstance {
  app: pc.Application;
  inUse: boolean;
  timestamp: number;
}

class PlayCanvasPreloader {
  private static instance: PlayCanvasPreloader;
  private modelCache = new Map<string, PreloadedModel>();
  private instancePool: PreloadedInstance[] = [];
  private canvasPool: HTMLCanvasElement[] = [];
  private maxCacheSize = 50;
  private maxPoolSize = 5;
  private maxCanvasPool = 3;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private isPreloadingBatch = false;

  static getInstance(): PlayCanvasPreloader {
    if (!PlayCanvasPreloader.instance) {
      PlayCanvasPreloader.instance = new PlayCanvasPreloader();
      // Initialize canvas pool immediately
      PlayCanvasPreloader.instance.initializeCanvasPool();
    }
    return PlayCanvasPreloader.instance;
  }

  // Pre-create canvas elements for instant use
  private initializeCanvasPool(): void {
    for (let i = 0; i < this.maxCanvasPool; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      this.canvasPool.push(canvas);
    }
  }

  // Get a pre-created canvas
  getCanvas(): HTMLCanvasElement | null {
    if (this.canvasPool.length > 0) {
      return this.canvasPool.pop() || null;
    }
    // Fallback: create new canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    return canvas;
  }

  // Return canvas to pool
  returnCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvasPool.length < this.maxCanvasPool) {
      // Clear the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      this.canvasPool.push(canvas);
    }
  }

  // Preload model in background
  async preloadModel(url: string): Promise<void> {
    if (!url?.trim() || this.modelCache.has(url)) return;

    try {
      const fileExtension = url.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'glb' || fileExtension === 'gltf') {
        // Create a temporary canvas for preloading
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 1;
        tempCanvas.height = 1;
        tempCanvas.style.display = 'none';
        document.body.appendChild(tempCanvas);

        const tempApp = new pc.Application(tempCanvas, {
          mouse: new pc.Mouse(tempCanvas),
          touch: new pc.TouchDevice(tempCanvas),
        });

        const asset = new pc.Asset('preload-model', 'container', { url });
        
        return new Promise((resolve) => {
          asset.ready(() => {
            this.modelCache.set(url, {
              asset: asset,
              timestamp: Date.now()
            });
            tempApp.destroy();
            tempCanvas.remove();
            this.cleanupCache();
            resolve();
          });

          asset.on('error', () => {
            tempApp.destroy();
            tempCanvas.remove();
            resolve(); // Don't throw, just resolve silently
          });

          tempApp.assets.add(asset);
          tempApp.assets.load(asset);
        });
      }
    } catch (error) {
      console.warn('PlayCanvasPreloader: Failed to preload model:', error);
    }
  }

  // Get preloaded model
  getPreloadedModel(url: string): any | null {
    const cached = this.modelCache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.asset;
    }
    return null;
  }

  // Get or create PlayCanvas instance
  getInstance(): pc.Application | null {
    // Find available instance
    const available = this.instancePool.find(instance => !instance.inUse);
    if (available) {
      available.inUse = true;
      available.timestamp = Date.now();
      return available.app;
    }

    return null; // Let the component create its own if pool is empty
  }

  // Return instance to pool
  returnInstance(app: pc.Application): void {
    const instance = this.instancePool.find(inst => inst.app === app);
    if (instance) {
      // Clear the scene but keep the app
      app.root.children.slice().forEach(child => {
        if (child.name !== 'camera' && child.name !== 'light') {
          child.destroy();
        }
      });
      instance.inUse = false;
      instance.timestamp = Date.now();
    }
  }

  // Cleanup old cache entries
  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.modelCache.entries());
    
    // Remove expired entries
    entries.forEach(([url, model]) => {
      if (now - model.timestamp > this.cacheTimeout) {
        this.modelCache.delete(url);
      }
    });

    // Remove oldest entries if cache is too large
    if (this.modelCache.size > this.maxCacheSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.modelCache.size - this.maxCacheSize);
      
      sortedEntries.forEach(([url]) => {
        this.modelCache.delete(url);
      });
    }
  }

  // Aggressive batch preload - starts immediately and preloads everything
  async aggressiveBatchPreload(urls: string[]): Promise<void> {
    if (this.isPreloadingBatch) return;
    this.isPreloadingBatch = true;

    const validUrls = urls.filter(url => url?.trim() && !this.modelCache.has(url));
    console.log(`PlayCanvasPreloader: Starting aggressive preload of ${validUrls.length} models`);
    
    // Preload all models concurrently with higher batch size
    const batchSize = 5;
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < validUrls.length; i += batchSize) {
      const batch = validUrls.slice(i, i + batchSize);
      promises.push(
        Promise.allSettled(batch.map(url => this.preloadModel(url)))
          .then(() => {
            console.log(`PlayCanvasPreloader: Completed batch ${i / batchSize + 1}/${Math.ceil(validUrls.length / batchSize)}`);
          })
      );
    }
    
    await Promise.allSettled(promises);
    this.isPreloadingBatch = false;
    console.log(`PlayCanvasPreloader: Completed aggressive preloading. Cache size: ${this.modelCache.size}`);
  }

  // Batch preload multiple models (original method for compatibility)
  async batchPreload(urls: string[]): Promise<void> {
    const validUrls = urls.filter(url => url?.trim() && !this.modelCache.has(url));
    
    // Limit concurrent preloads to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < validUrls.length; i += batchSize) {
      const batch = validUrls.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(url => this.preloadModel(url)));
    }
  }

  // Get cache stats for debugging
  getCacheStats() {
    return {
      modelCacheSize: this.modelCache.size,
      instancePoolSize: this.instancePool.length,
      availableInstances: this.instancePool.filter(i => !i.inUse).length
    };
  }
}

export const usePlayCanvasPreloader = () => {
  const preloader = useRef(PlayCanvasPreloader.getInstance());

  const preloadModel = useCallback(async (url: string) => {
    await preloader.current.preloadModel(url);
  }, []);

  const batchPreload = useCallback(async (urls: string[]) => {
    await preloader.current.batchPreload(urls);
  }, []);

  const aggressiveBatchPreload = useCallback(async (urls: string[]) => {
    await preloader.current.aggressiveBatchPreload(urls);
  }, []);

  const getPreloadedModel = useCallback((url: string) => {
    return preloader.current.getPreloadedModel(url);
  }, []);

  const getInstance = useCallback(() => {
    return preloader.current.getInstance();
  }, []);

  const returnInstance = useCallback((app: pc.Application) => {
    preloader.current.returnInstance(app);
  }, []);

  const getCanvas = useCallback(() => {
    return preloader.current.getCanvas();
  }, []);

  const returnCanvas = useCallback((canvas: HTMLCanvasElement) => {
    preloader.current.returnCanvas(canvas);
  }, []);

  const getCacheStats = useCallback(() => {
    return preloader.current.getCacheStats();
  }, []);

  return {
    preloadModel,
    batchPreload,
    aggressiveBatchPreload,
    getPreloadedModel,
    getInstance,
    returnInstance,
    getCanvas,
    returnCanvas,
    getCacheStats
  };
};
