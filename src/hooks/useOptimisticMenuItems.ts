
import { useState, useCallback } from 'react';
import { MenuItem } from '@/types';
import { useMenuItems } from '@/hooks/useMenuItems';
import { logger } from '@/utils/logger';

export const useOptimisticMenuItems = (restaurantId?: string) => {
  const {
    menuItems: serverMenuItems,
    isLoading: serverLoading,
    error,
    deleteMenuItem: serverDeleteMenuItem,
    toggleMenuItemActive: serverToggleMenuItemActive,
    refreshMenuItems
  } = useMenuItems(restaurantId);

  const [optimisticUpdates, setOptimisticUpdates] = useState<{
    deletedIds: Set<string>;
    toggledItems: Map<string, boolean>;
  }>({
    deletedIds: new Set(),
    toggledItems: new Map()
  });

  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  // Apply optimistic updates to the server data
  const menuItems = serverMenuItems
    .filter(item => !optimisticUpdates.deletedIds.has(item.id))
    .map(item => {
      const toggledStatus = optimisticUpdates.toggledItems.get(item.id);
      if (toggledStatus !== undefined) {
        return { ...item, is_active: toggledStatus };
      }
      return item;
    });

  const deleteMenuItem = useCallback(async (itemId: string) => {
    logger.debug('Starting optimistic delete for item:', itemId);
    
    // Optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      deletedIds: new Set([...prev.deletedIds, itemId])
    }));
    
    setPendingOperations(prev => new Set([...prev, itemId]));

    try {
      await serverDeleteMenuItem(itemId);
      logger.debug('Delete operation completed successfully for item:', itemId);
    } catch (error) {
      logger.error('Delete operation failed, reverting optimistic update:', error);
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const newDeletedIds = new Set(prev.deletedIds);
        newDeletedIds.delete(itemId);
        return {
          ...prev,
          deletedIds: newDeletedIds
        };
      });
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [serverDeleteMenuItem]);

  const toggleMenuItemActive = useCallback(async (itemId: string, isActive: boolean) => {
    logger.debug('Starting optimistic toggle for item:', { itemId, isActive });
    
    // Optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      toggledItems: new Map([...prev.toggledItems, [itemId, isActive]])
    }));
    
    setPendingOperations(prev => new Set([...prev, itemId]));

    try {
      await serverToggleMenuItemActive({ itemId, isActive });
      logger.debug('Toggle operation completed successfully for item:', { itemId, isActive });
    } catch (error) {
      logger.error('Toggle operation failed, reverting optimistic update:', error);
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const newToggledItems = new Map(prev.toggledItems);
        newToggledItems.delete(itemId);
        return {
          ...prev,
          toggledItems: newToggledItems
        };
      });
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [serverToggleMenuItemActive]);

  const isItemPending = useCallback((itemId: string) => {
    return pendingOperations.has(itemId);
  }, [pendingOperations]);

  // Clear optimistic updates when server data changes
  const handleRefresh = useCallback(() => {
    logger.debug('Refreshing menu items and clearing optimistic updates');
    setOptimisticUpdates({
      deletedIds: new Set(),
      toggledItems: new Map()
    });
    setPendingOperations(new Set());
    refreshMenuItems();
  }, [refreshMenuItems]);

  return {
    menuItems,
    isLoading: serverLoading,
    error,
    deleteMenuItem,
    toggleMenuItemActive,
    isItemPending,
    refreshMenuItems: handleRefresh,
    hasPendingOperations: pendingOperations.size > 0
  };
};
