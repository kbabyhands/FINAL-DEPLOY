
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
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
      logger.debug('Fetching restaurant data');
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching restaurant data:', error);
        throw error;
      }

      logger.debug('Successfully fetched restaurant data:', data?.name || 'No restaurant found');
      return data;
    },
    retry: 1
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: Partial<Restaurant> & { name: string }) => {
      logger.debug('Updating restaurant:', restaurantData.name);
      
      // Ensure user_id is included for the upsert operation
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        logger.error('User not authenticated for restaurant update');
        throw new Error('User not authenticated');
      }

      const dataToUpsert = {
        ...restaurantData,
        user_id: userData.user.id
      };

      const { data, error } = await supabase
        .from('restaurants')
        .upsert(dataToUpsert)
        .select()
        .single();

      if (error) {
        logger.error('Error updating restaurant:', error);
        throw error;
      }
      
      logger.debug('Successfully updated restaurant:', data.name);
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
      logger.debug('Creating restaurant:', restaurantData.name);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        logger.error('User not authenticated for restaurant creation');
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('restaurants')
        .insert({ ...restaurantData, user_id: userData.user.id })
        .select()
        .single();

      if (error) {
        logger.error('Error creating restaurant:', error);
        throw error;
      }
      
      logger.debug('Successfully created restaurant:', data.name);
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
