
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useErrorHandler } from '@/utils/errorHandler';

export const useMenuItemViews = () => {
  const { handleSupabaseError } = useErrorHandler();

  const trackView = useCallback(async (menuItemId: string) => {
    // Validate menuItemId before proceeding
    if (!menuItemId || typeof menuItemId !== 'string') {
      logger.warn('Invalid menu item ID provided for view tracking:', menuItemId);
      return;
    }

    try {
      // First, verify the menu item exists
      const { data: menuItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('id', menuItemId)
        .single();

      if (fetchError || !menuItem) {
        logger.warn('Menu item not found for view tracking:', menuItemId);
        return;
      }

      // Generate a simple session ID for tracking unique sessions
      let sessionId = sessionStorage.getItem('menu_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('menu_session_id', sessionId);
        logger.debug('Generated new session ID for menu tracking');
      }

      const { error } = await supabase
        .from('menu_item_views')
        .insert({
          menu_item_id: menuItemId,
          user_session: sessionId,
          ip_address: null // We can't easily get IP on client-side, server would handle this
        });

      if (error) {
        logger.error('Error tracking menu item view:', error);
      } else {
        logger.debug('Menu item view tracked successfully for:', menuItemId);
      }
    } catch (error: any) {
      logger.error('Error in trackView function:', error);
      // Don't show toast for tracking errors as it would be annoying for users
    }
  }, []);

  return { trackView };
};
