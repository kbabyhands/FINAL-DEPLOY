
// Development-only logging utility
class Logger {
  private isDevelopment = import.meta.env.DEV;

  log(...args: any[]) {
    if (this.isDevelopment) {
      console.log('[APP]', ...args);
    }
  }

  error(...args: any[]) {
    if (this.isDevelopment) {
      console.error('[ERROR]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  }

  info(...args: any[]) {
    if (this.isDevelopment) {
      console.info('[INFO]', ...args);
    }
  }

  debug(...args: any[]) {
    if (this.isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  }
}

export const logger = new Logger();
