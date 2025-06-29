
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  maxRetries?: number;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  disabled = false,
  children = 'Retry',
  variant = 'outline',
  size = 'sm',
  maxRetries = 3
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      logger.warn('Maximum retry attempts reached');
      return;
    }

    logger.debug(`Retry attempt ${retryCount + 1}/${maxRetries}`);
    setIsRetrying(true);
    
    try {
      await onRetry();
      setRetryCount(0); // Reset on success
      logger.debug('Retry successful');
    } catch (error) {
      logger.error('Retry failed:', error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const isDisabled = disabled || isRetrying || retryCount >= maxRetries;

  return (
    <Button
      onClick={handleRetry}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Retrying...' : children}
      {retryCount > 0 && ` (${retryCount}/${maxRetries})`}
    </Button>
  );
};
