/**
 * Logger Utility
 * This utility provides a simple logging interface for the application.
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Current log level (can be changed at runtime)
let currentLogLevel = LogLevel.INFO;

// Set the log level
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

// Get the current log level
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

// Logger interface
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Create a logger for a specific module
 * @param module The module name
 * @returns A logger instance
 */
export function createLogger(module: string): Logger {
  return {
    debug(message: string, ...args: any[]): void {
      if (currentLogLevel <= LogLevel.DEBUG) {
        console.debug(`[${module}] ${message}`, ...args);
      }
    },
    
    info(message: string, ...args: any[]): void {
      if (currentLogLevel <= LogLevel.INFO) {
        console.info(`[${module}] ${message}`, ...args);
      }
    },
    
    warn(message: string, ...args: any[]): void {
      if (currentLogLevel <= LogLevel.WARN) {
        console.warn(`[${module}] ${message}`, ...args);
      }
    },
    
    error(message: string, ...args: any[]): void {
      if (currentLogLevel <= LogLevel.ERROR) {
        console.error(`[${module}] ${message}`, ...args);
      }
    }
  };
}

// Default logger
export const logger = createLogger('Widget');
