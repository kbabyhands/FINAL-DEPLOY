
import { useToast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  private static toast: ReturnType<typeof useToast>['toast'] | null = null;

  static setToast(toastFn: ReturnType<typeof useToast>['toast']) {
    this.toast = toastFn;
  }

  static handleError(error: unknown, context?: string): AppError {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);

    let appError: AppError;

    if (error && typeof error === 'object' && 'message' in error) {
      appError = {
        message: (error as any).message || 'An unexpected error occurred',
        code: (error as any).code,
        details: error
      };
    } else if (typeof error === 'string') {
      appError = {
        message: error
      };
    } else {
      appError = {
        message: 'An unexpected error occurred',
        details: error
      };
    }

    // Show toast notification if available
    if (this.toast) {
      this.toast({
        title: 'Error',
        description: appError.message,
        variant: 'destructive'
      });
    }

    return appError;
  }

  static handleAsyncError<T>(
    promise: Promise<T>,
    context?: string
  ): Promise<{ data?: T; error?: AppError }> {
    return promise
      .then((data) => ({ data }))
      .catch((error) => ({ error: this.handleError(error, context) }));
  }

  // Specific error handlers for common scenarios
  static handleAuthError(error: unknown): AppError {
    const appError = this.handleError(error, 'Authentication');
    
    // Provide more user-friendly messages for common auth errors
    if (appError.code === 'auth/user-not-found' || appError.code === 'auth/wrong-password') {
      appError.message = 'Invalid email or password';
    } else if (appError.code === 'auth/email-already-in-use') {
      appError.message = 'An account with this email already exists';
    } else if (appError.code === 'auth/weak-password') {
      appError.message = 'Password should be at least 6 characters';
    } else if (appError.code === 'auth/invalid-email') {
      appError.message = 'Please enter a valid email address';
    }

    return appError;
  }

  static handleSupabaseError(error: unknown, operation?: string): AppError {
    const appError = this.handleError(error, `Supabase ${operation || 'operation'}`);
    
    // Handle common Supabase errors
    if (appError.code === 'PGRST301') {
      appError.message = 'You do not have permission to perform this action';
    } else if (appError.code === 'PGRST116') {
      appError.message = 'No data found';
    }

    return appError;
  }

  static handleFileUploadError(error: unknown): AppError {
    const appError = this.handleError(error, 'File upload');
    
    // Handle file-specific errors
    if (appError.message.includes('file size')) {
      appError.message = 'File is too large. Please choose a smaller file.';
    } else if (appError.message.includes('file type')) {
      appError.message = 'File type not supported. Please choose a different file.';
    }

    return appError;
  }
}

// Hook for using error handler in components
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  // Set the toast function on the ErrorHandler
  if (!ErrorHandler['toast']) {
    ErrorHandler.setToast(toast);
  }

  return {
    handleError: (error: unknown, context?: string) => ErrorHandler.handleError(error, context),
    handleAsyncError: <T>(promise: Promise<T>, context?: string) => 
      ErrorHandler.handleAsyncError(promise, context),
    handleAuthError: (error: unknown) => ErrorHandler.handleAuthError(error),
    handleSupabaseError: (error: unknown, operation?: string) => 
      ErrorHandler.handleSupabaseError(error, operation),
    handleFileUploadError: (error: unknown) => ErrorHandler.handleFileUploadError(error)
  };
};
