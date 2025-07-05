import { useEffect } from 'react';
import { usePlayCanvasPreloader } from './usePlayCanvasPreloader';

interface MenuItem {
  model_url?: string;
}

// Hook to aggressively preload all 3D models on the page
export const useMenuPreloader = (menuItems: MenuItem[]) => {
  const { aggressiveBatchPreload } = usePlayCanvasPreloader();

  useEffect(() => {
    // Extract all model URLs from menu items
    const modelUrls: string[] = [];
    
    menuItems.forEach(item => {
      if (item.model_url?.trim()) {
        modelUrls.push(item.model_url);
      }
    });

    if (modelUrls.length > 0) {
      console.log(`MenuPreloader: Starting aggressive preload of ${modelUrls.length} models`);
      
      // Start preloading after a short delay to not block initial page render
      const timer = setTimeout(() => {
        aggressiveBatchPreload(modelUrls);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [menuItems, aggressiveBatchPreload]);
};