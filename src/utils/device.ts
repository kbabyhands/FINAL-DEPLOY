import { APP_CONFIG } from '@/constants';
import type { DeviceCapabilities } from '@/types';

/**
 * Detects device capabilities and performance characteristics
 * Used to determine if performance optimizations should be applied
 */
export const detectDeviceCapabilities = (): DeviceCapabilities => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  const hasLowMemory = 
    (navigator as any).deviceMemory && 
    (navigator as any).deviceMemory < APP_CONFIG.PERFORMANCE_THRESHOLDS.LOW_MEMORY_GB;
  
  const hasSlowConnection = 
    (navigator as any).connection && 
    APP_CONFIG.PERFORMANCE_THRESHOLDS.SLOW_CONNECTION_TYPES.includes(
      (navigator as any).connection.effectiveType
    );
  
  const performanceMode = isMobile || hasLowMemory || hasSlowConnection;

  return {
    isMobile,
    hasLowMemory,
    hasSlowConnection,
    performanceMode,
  };
};