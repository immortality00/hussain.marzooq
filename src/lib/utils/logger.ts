/**
 * Basic logger utility that wraps console methods
 * In a production environment, this could be replaced with a more robust solution
 * like Winston, Pino, or a cloud-based logging service
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  includeTimestamp?: boolean;
}

class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      prefix: options.prefix || '[App]',
      includeTimestamp: options.includeTimestamp !== undefined ? options.includeTimestamp : true,
    };
  }

  /**
   * Format the log message with prefix and timestamp if enabled
   */
  private formatMessage(message: string): string {
    const parts = [this.options.prefix];
    
    if (this.options.includeTimestamp) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }
    
    parts.push(message);
    return parts.join(' ');
  }

  /**
   * Get environment-specific log level minimum
   * In production, we might want to suppress debug logs
   */
  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      return level !== 'debug';
    }
    return true;
  }

  /**
   * Debug level logging
   */
  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) return;
    
    if (args.length > 0) {
      console.debug(this.formatMessage(message), ...args);
    } else {
      console.debug(this.formatMessage(message));
    }
  }

  /**
   * Info level logging
   */
  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return;
    
    if (args.length > 0) {
      console.info(this.formatMessage(message), ...args);
    } else {
      console.info(this.formatMessage(message));
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) return;
    
    if (args.length > 0) {
      console.warn(this.formatMessage(message), ...args);
    } else {
      console.warn(this.formatMessage(message));
    }
  }

  /**
   * Error level logging
   */
  error(message: string, ...args: any[]): void {
    if (!this.shouldLog('error')) return;
    
    if (args.length > 0) {
      console.error(this.formatMessage(message), ...args);
    } else {
      console.error(this.formatMessage(message));
    }
  }
}

// Create a default logger instance
export const logger = new Logger();

// Export the class for custom instances
export default Logger; 