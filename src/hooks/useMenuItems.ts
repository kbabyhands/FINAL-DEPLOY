
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/utils/errorHandler';
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
      if (!restaurantId) return [];
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!restaurantId
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
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
      const { error } = await supabase
        .from('menu_items')
        .update({ is_active: isActive })
        .eq('id', itemId);

      if (error) throw error;
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
