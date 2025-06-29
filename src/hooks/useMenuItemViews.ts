
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useErrorHandler } from '@/utils/errorHandler';

export const useMenuItemViews = () => {
  const { handleSupabaseError } = useErrorHandler();

  const trackView = useCallback(async (menuItemId: string) => {
    try {
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
        // Don't use handleSupabaseError here as it shows toast notifications
        // and tracking errors shouldn't be intrusive to users
        logger.error('Error tracking menu item view:', error);
      } else {
        logger.debug('Menu item view tracked successfully');
      }
    } catch (error: any) {
      logger.error('Error tracking view:', error);
      // Don't show toast for tracking errors as it would be annoying for users
    }
  }, []);

  return { trackView };
};
