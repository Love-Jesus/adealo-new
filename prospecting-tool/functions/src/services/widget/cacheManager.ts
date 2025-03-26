/**
 * Cache Manager for Widget Configuration
 * 
 * This service manages the caching of widget configurations to improve performance.
 */
import * as admin from 'firebase-admin';
import { WidgetConfig } from '../../types/widget/config.types';
import { createLogger } from '../../utils/logger';

// Create a logger for this module
const logger = createLogger('CacheManager');

/**
 * Cache Manager for Widget Configuration
 * 
 * This class manages the caching of widget configurations in memory and Firestore.
 */
export class CacheManager {
  private cache: Map<string, { config: WidgetConfig; timestamp: number }>;
  private db: admin.firestore.Firestore;
  private readonly CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
  
  constructor() {
    this.cache = new Map();
    this.db = admin.firestore();
    
    logger.info('Cache Manager initialized');
  }
  
  /**
   * Get a widget configuration from the cache
   * @param widgetId The widget ID
   * @returns The widget configuration or null if not found or expired
   */
  get(widgetId: string): WidgetConfig | null {
    // Check if the configuration is in the memory cache
    const cachedItem = this.cache.get(widgetId);
    
    if (cachedItem) {
      // Check if the cache is still valid
      if (Date.now() - cachedItem.timestamp < this.CACHE_EXPIRY) {
        logger.debug(`Cache hit for widgetId: ${widgetId}`);
        return cachedItem.config;
      }
      
      // Cache is expired, remove it
      this.cache.delete(widgetId);
      logger.debug(`Cache expired for widgetId: ${widgetId}`);
    }
    
    return null;
  }
  
  /**
   * Set a widget configuration in the cache
   * @param widgetId The widget ID
   * @param config The widget configuration
   */
  set(widgetId: string, config: WidgetConfig): void {
    // Set the configuration in the memory cache
    this.cache.set(widgetId, {
      config,
      timestamp: Date.now()
    });
    
    logger.debug(`Cache set for widgetId: ${widgetId}`);
  }
  
  /**
   * Clear the cache for a specific widget
   * @param widgetId The widget ID
   */
  clear(widgetId: string): void {
    // Clear the configuration from the memory cache
    this.cache.delete(widgetId);
    
    logger.debug(`Cache cleared for widgetId: ${widgetId}`);
  }
  
  /**
   * Clear the entire cache
   */
  clearAll(): void {
    // Clear the entire memory cache
    this.cache.clear();
    
    logger.debug('Cache cleared');
  }
}

// Export a singleton instance
export const cacheManager = new CacheManager();
