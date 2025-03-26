import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WidgetConfig } from '../../../types/widget/config.types';
import { getWidgetConfig } from '../../../services/widgetConfig';
import { trackEvent } from '../../../services/analytics';

// Create context for widget configuration
interface WidgetConfigContextType {
  config: WidgetConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
}

const WidgetConfigContext = createContext<WidgetConfigContextType>({
  config: null,
  isLoading: true,
  error: null,
  refreshConfig: async () => {}
});

// Props for ConfigProvider component
interface ConfigProviderProps {
  widgetId: string;
  children: ReactNode;
}

/**
 * Widget Configuration Provider
 * This component provides the widget configuration to all child components.
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({ widgetId, children }) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch configuration
  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const widgetConfig = await getWidgetConfig(widgetId);
      setConfig(widgetConfig);
      
      // Track successful configuration load
      trackEvent('widget_config_loaded', { widgetId });
    } catch (err) {
      console.error('Error loading widget configuration:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Track configuration load error
      trackEvent('widget_config_error', { 
        widgetId, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch configuration on mount
  useEffect(() => {
    fetchConfig();
  }, [widgetId]);

  // Context value
  const value = {
    config,
    isLoading,
    error,
    refreshConfig: fetchConfig
  };

  return (
    <WidgetConfigContext.Provider value={value}>
      {children}
    </WidgetConfigContext.Provider>
  );
};

/**
 * Hook to use widget configuration
 * @returns Widget configuration context
 */
export const useWidgetConfig = () => {
  const context = useContext(WidgetConfigContext);
  
  if (context === undefined) {
    throw new Error('useWidgetConfig must be used within a ConfigProvider');
  }
  
  return context;
};

/**
 * Configuration Loader Component
 * This component handles loading states for widget configuration.
 */
interface ConfigLoaderProps {
  children: (config: WidgetConfig) => ReactNode;
  fallback?: ReactNode;
  errorFallback?: (error: string) => ReactNode;
}

export const ConfigLoader: React.FC<ConfigLoaderProps> = ({ 
  children, 
  fallback = null, 
  errorFallback = (error) => <div>Error loading widget: {error}</div> 
}) => {
  const { config, isLoading, error } = useWidgetConfig();
  
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  if (error || !config) {
    return <>{errorFallback(error || 'Configuration not found')}</>;
  }
  
  return <>{children(config)}</>;
};
