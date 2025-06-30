
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { MenuItem } from '@/types';

export const useMenuItems = (restaurantId?: string) => {
  const { toast } = useToast();
  const { handleSupabaseError } = useErrorHandler();
  const queryClient = useQueryClient();

  const {
    data: menuItems = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['menuItems', restaurantId],
    queryFn: async () => {
      if (!restaurantId) {
        logger.debug('No restaurant ID provided for menu items query');
        return [];
      }
      
      logger.debug('Fetching menu items for restaurant:', restaurantId);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching menu items:', error);
        throw error;
      }
      
      logger.debug('Successfully fetched menu items:', data?.length || 0);
      return data || [];
    },
    enabled: !!restaurantId
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      logger.debug('Deleting menu item:', itemId);
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        logger.error('Error deleting menu item:', error);
        throw error;
      }
      
      logger.debug('Successfully deleted menu item:', itemId);
    },
    onMutate: async (itemId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['menuItems', restaurantId] });
      const previousItems = queryClient.getQueryData(['menuItems', restaurantId]);
      
      queryClient.setQueryData(['menuItems', restaurantId], (old: MenuItem[] = []) =>
        old.filter(item => item.id !== itemId)
      );

      return { previousItems };
    },
    onError: (error, itemId, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(['menuItems', restaurantId], context.previousItems);
      }
      handleSupabaseError(error, 'menu item deletion');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
    }
  });

  const toggleMenuItemActiveMutation = useMutation({
    mutationFn: async ({ itemId, isActive }: { itemId: string; isActive: boolean }) => {
      logger.debug('Toggling menu item active status:', { itemId, isActive });
      
      const { error } = await supabase
        .from('menu_items')
        .update({ is_active: isActive })
        .eq('id', itemId);

      if (error) {
        logger.error('Error toggling menu item status:', error);
        throw error;
      }
      
      logger.debug('Successfully toggled menu item status:', { itemId, isActive });
    },
    onMutate: async ({ itemId, isActive }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['menuItems', restaurantId] });
      const previousItems = queryClient.getQueryData(['menuItems', restaurantId]);
      
      queryClient.setQueryData(['menuItems', restaurantId], (old: MenuItem[] = []) =>
        old.map(item => 
          item.id === itemId ? { ...item, is_active: isActive } : item
        )
      );

      return { previousItems };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(['menuItems', restaurantId], context.previousItems);
      }
      handleSupabaseError(error, 'menu item status update');
    },
    onSuccess: (_, { isActive }) => {
      toast({
        title: "Success",
        description: `Menu item ${isActive ? 'activated' : 'deactivated'}`
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
    }
  });

  const refreshMenuItems = () => {
    logger.debug('Refreshing menu items for restaurant:', restaurantId);
    queryClient.invalidateQueries({ queryKey: ['menuItems', restaurantId] });
  };

  return {
    menuItems,
    isLoading,
    error,
    deleteMenuItem: deleteMenuItemMutation.mutate,
    toggleMenuItemActive: toggleMenuItemActiveMutation.mutate,
    isDeleting: deleteMenuItemMutation.isPending,
    isTogglingActive: toggleMenuItemActiveMutation.isPending,
    refreshMenuItems
  };
};
