/**
 * Hooks Barrel Export
 * 
 * Centralizes all custom hook exports for easier imports throughout the application.
 * Organized by functionality and usage patterns.
 */

// Menu Data Hooks
export { useMenuData } from './useMenuData';
export { useMenuFilters } from './useMenuFilters';
export { useFeaturedItems } from './useFeaturedItems';

// Performance & Analytics Hooks
export { useMenuItemViews } from './useMenuItemViews';
export { useMenuPreloader } from './useMenuPreloader';
export { usePlayCanvasPreloader } from './usePlayCanvasPreloader';

// Generic API Hook
export { useApiQuery } from './useApiQuery';

// UI Hooks (from shadcn/ui)
export { useToast } from './use-toast';
export { useIsMobile } from './use-mobile';