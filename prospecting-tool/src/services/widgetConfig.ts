/**
 * Widget Configuration Service
 * 
 * This service provides functions for fetching and caching widget configurations.
 */
import { WidgetConfig } from '../types/widget/config.types';

// Cache key prefix
const CACHE_KEY_PREFIX = 'widget_config_';

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Fetch widget configuration from the API
 * @param widgetId The widget ID
 * @returns The widget configuration
 */
export async function fetchWidgetConfig(widgetId: string): Promise<WidgetConfig> {
  try {
    // Fetch configuration from the API
    const response = await fetch(`https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetConfigHttp?widgetId=${widgetId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch widget configuration: ${response.statusText}`);
    }
    
    const config = await response.json();
    
    // Cache the configuration
    cacheWidgetConfig(widgetId, config);
    
    return config;
  } catch (error) {
    console.error('Error fetching widget configuration:', error);
    throw error;
  }
}

/**
 * Cache widget configuration in browser storage
 * @param widgetId The widget ID
 * @param config The widget configuration
 */
export function cacheWidgetConfig(widgetId: string, config: WidgetConfig): void {
  try {
    // Create cache entry with expiration timestamp
    const cacheEntry = {
      config,
      expiresAt: Date.now() + CACHE_EXPIRATION
    };
    
    // Store in localStorage
    localStorage.setItem(`${CACHE_KEY_PREFIX}${widgetId}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error caching widget configuration:', error);
    // Fail silently - caching is optional
  }
}

/**
 * Get cached widget configuration
 * @param widgetId The widget ID
 * @returns The cached widget configuration or null if not found or expired
 */
export function getCachedConfig(widgetId: string): WidgetConfig | null {
  try {
    // Get from localStorage
    const cacheEntryJson = localStorage.getItem(`${CACHE_KEY_PREFIX}${widgetId}`);
    
    if (!cacheEntryJson) {
      return null;
    }
    
    const cacheEntry = JSON.parse(cacheEntryJson);
    
    // Check if cache has expired
    if (cacheEntry.expiresAt < Date.now()) {
      // Cache has expired, remove it
      clearConfigCache(widgetId);
      return null;
    }
    
    return cacheEntry.config;
  } catch (error) {
    console.error('Error getting cached widget configuration:', error);
    return null;
  }
}

/**
 * Clear widget configuration cache
 * @param widgetId The widget ID (optional - if not provided, all widget configs will be cleared)
 */
export function clearConfigCache(widgetId?: string): void {
  try {
    if (widgetId) {
      // Clear specific widget configuration
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${widgetId}`);
    } else {
      // Clear all widget configurations
      const keysToRemove: string[] = [];
      
      // Find all widget configuration keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Error clearing widget configuration cache:', error);
    // Fail silently - cache clearing is optional
  }
}

/**
 * Get widget configuration with caching
 * This function first tries to get the configuration from cache,
 * and if not found or expired, fetches it from the API.
 * @param widgetId The widget ID
 * @returns The widget configuration
 */
export async function getWidgetConfig(widgetId: string): Promise<WidgetConfig> {
  // Try to get from cache first
  const cachedConfig = getCachedConfig(widgetId);
  
  if (cachedConfig) {
    return cachedConfig;
  }
  
  // If not in cache or expired, fetch from API
  return fetchWidgetConfig(widgetId);
}
