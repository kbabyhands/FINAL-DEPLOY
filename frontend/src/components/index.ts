/**
 * Components Barrel Export
 * 
 * Centralizes all component exports for easier imports throughout the application.
 * Organized by functionality and usage patterns.
 */

// Core Menu Components
export { default as MenuCard } from './MenuCard';
export { MenuGrid } from './MenuGrid';
export { default as FeaturedItems } from './FeaturedItems';
export { default as MenuItemDialog } from './MenuItemDialog';

// Filter Components
export { default as CategoryFilter } from './CategoryFilter';
export { default as DietaryFilter } from './DietaryFilter';

// UI Components
export { default as DietaryBadges } from './DietaryBadges';
export { default as ViewerToggle } from './ViewerToggle';

// Layout Components
export { MenuHeader } from './MenuHeader';
export { EmptyMenuState } from './EmptyMenuState';
export { LoadingSpinner } from './LoadingSpinner';

// Form Components
export { default as ReviewForm } from './ReviewForm';
export { default as MenuItemForm } from './MenuItemForm';

// Admin Components
export { default as AdminDashboard } from './AdminDashboard';
export { default as RestaurantProfile } from './RestaurantProfile';
export { default as AnalyticsDashboard } from './AnalyticsDashboard';

// Specialized Components
export { default as QRCodeGenerator } from './QRCodeGenerator';
export { default as FileUpload } from './FileUpload';
export { default as ReviewsSection } from './ReviewsSection';

// 3D Viewers
export { default as PlayCanvasViewer } from './PlayCanvasViewer';
export { default as GaussianSplatViewer } from './GaussianSplatViewer';
export { default as SplineViewer } from './SplineViewer';

// Common Components
export * from './common';

// UI Library Re-exports (for convenience)
export * from './ui/button';
export * from './ui/card';
export * from './ui/dialog';
export * from './ui/badge';
export * from './ui/alert';