
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/utils/errorHandler';
import { Restaurant } from '@/types';

export const useRestaurantData = () => {
  const { toast } = useToast();
  const { handleSupabaseError } = useErrorHandler();
  const queryClient = useQueryClient();

  const {
    data: restaurant,
    isLoading,
    error
  } = useQuery({
    queryKey: ['restaurant'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    retry: 1
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: Partial<Restaurant>) => {
      const { data, error } = await supabase
        .from('restaurants')
        .upsert(restaurantData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['restaurant'], data);
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully"
      });
    },
    onError: (error) => {
      handleSupabaseError(error, 'restaurant update');
    }
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('restaurants')
        .insert({ ...restaurantData, user_id: userData.user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['restaurant'], data);
      toast({
        title: "Success",
        description: "Restaurant profile created successfully"
      });
    },
    onError: (error) => {
      handleSupabaseError(error, 'restaurant creation');
    }
  });

  return {
    restaurant,
    isLoading,
    error,
    updateRestaurant: updateRestaurantMutation.mutate,
    createRestaurant: createRestaurantMutation.mutate,
    isUpdating: updateRestaurantMutation.isPending,
    isCreating: createRestaurantMutation.isPending
  };
};
