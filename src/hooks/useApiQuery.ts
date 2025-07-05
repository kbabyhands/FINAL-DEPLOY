import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/services/api';
import type { LoadingState, ApiResponse } from '@/types';

/**
 * Generic API query hook with loading states and error handling
 * 
 * Features:
 * - Automatic loading state management
 * - Error handling with retry capability
 * - Type-safe responses
 * - Dependency-based refetching
 */
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options?: {
    enabled?: boolean;
    retry?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): ApiResponse<T> & { refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      options?.onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    loading,
    refetch,
  };
}