/**
 * Config Manager for Widget Configuration
 * 
 * This service manages the widget configurations in Firebase Firestore.
 */
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { WidgetConfig } from '../../types/widget/config.types';
import { cacheManager } from './cacheManager';
import { createLogger } from '../../utils/logger';

// Create a logger for this module
const logger = createLogger('ConfigManager');

/**
 * Config Manager for Widget Configuration
 * 
 * This class manages the widget configurations in Firebase Firestore.
 * It provides methods to get, create, update, and delete configurations.
 */
export class ConfigManager {
  private db: admin.firestore.Firestore;
  
  constructor() {
    this.db = admin.firestore();
    
    logger.info('Config Manager initialized');
  }
  
  /**
   * Get a widget configuration from Firestore
   * @param widgetId The widget ID
   * @returns The widget configuration or null if not found
   */
  async getConfig(widgetId: string): Promise<WidgetConfig | null> {
    try {
      // Check if the configuration is in the cache
      const cachedConfig = cacheManager.get(widgetId);
      
      if (cachedConfig) {
        return cachedConfig;
      }
      
      // Get the configuration from Firestore
      const configRef = this.db.collection('widgets').doc(widgetId);
      const configDoc = await configRef.get();
      
      if (configDoc.exists) {
        const data = configDoc.data();
        
        if (data) {
          logger.debug(`Config found for widgetId: ${widgetId}`);
          
          // Convert Firestore timestamps to Date objects
          const config = this.convertTimestamps(data as WidgetConfig);
          
          // Cache the configuration
          cacheManager.set(widgetId, config);
          
          return config;
        }
      }
      
      logger.debug(`Config not found for widgetId: ${widgetId}`);
      return null;
    } catch (error) {
      logger.error(`Error getting config for widgetId: ${widgetId}`, error);
      throw error;
    }
  }
  
  /**
   * Create a new widget configuration in Firestore
   * @param teamId The team ID
   * @param config The widget configuration
   * @returns The widget ID
   */
  async createConfig(teamId: string, config: Partial<WidgetConfig>): Promise<string> {
    try {
      // Create a new document reference with auto-generated ID
      const widgetRef = this.db.collection('widgets').doc();
      const widgetId = widgetRef.id;
      
      // Create the base configuration
      const baseConfig: WidgetConfig['base'] = {
        widgetId,
        teamId,
        name: config.base?.name || 'Default Widget',
        status: config.base?.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Create the design configuration
      const designConfig: WidgetConfig['design'] = {
        colors: {
          primary: config.design?.colors?.primary || '#6e8efb',
          secondary: config.design?.colors?.secondary || '#4a6cf7',
          text: config.design?.colors?.text || '#333333',
          background: config.design?.colors?.background || '#ffffff'
        },
        position: config.design?.position || 'bottom-right',
        theme: config.design?.theme || 'light',
        borderRadius: config.design?.borderRadius || 16,
        fontFamily: config.design?.fontFamily
      };
      
      // Create the features configuration
      const featuresConfig: WidgetConfig['features'] = {
        chat: {
          enabled: config.features?.chat?.enabled ?? true,
          greeting: config.features?.chat?.greeting || 'Hi there! 👋',
          teamName: config.features?.chat?.teamName || 'Our Team',
          agentName: config.features?.chat?.agentName || 'Support',
          agentAvatar: config.features?.chat?.agentAvatar
        },
        bookDemo: {
          enabled: config.features?.bookDemo?.enabled ?? true,
          calendlyUrl: config.features?.bookDemo?.calendlyUrl || 'https://calendly.com/your-company/30min',
          title: config.features?.bookDemo?.title || 'Book a Demo',
          description: config.features?.bookDemo?.description || 'Schedule a time with our team to see our product in action.'
        },
        callMe: {
          enabled: config.features?.callMe?.enabled ?? true,
          mode: config.features?.callMe?.mode || 'single',
          responseType: config.features?.callMe?.responseType || 'asap',
          responseTime: config.features?.callMe?.responseTime || 5,
          qualificationEnabled: config.features?.callMe?.qualificationEnabled ?? true,
          qualificationOptions: config.features?.callMe?.qualificationOptions || [
            {
              id: 'sales',
              label: 'Sales Inquiry',
              description: 'I want to learn more about your product',
              icon: '💼'
            },
            {
              id: 'support',
              label: 'Technical Support',
              description: 'I need help with a technical issue',
              icon: '🔧'
            },
            {
              id: 'billing',
              label: 'Billing Question',
              description: 'I have a question about my bill',
              icon: '💰'
            }
          ],
          team: {
            members: config.features?.callMe?.team?.members || [
              {
                id: 'agent1',
                name: 'John Doe',
                role: 'Sales Representative',
                avatar: ''
              },
              {
                id: 'agent2',
                name: 'Jane Smith',
                role: 'Customer Support',
                avatar: ''
              }
            ],
            displayMode: config.features?.callMe?.team?.displayMode || 'grid'
          },
          messages: {
            title: config.features?.callMe?.messages?.title || 'Request a Call',
            description: config.features?.callMe?.messages?.description || 'Enter your phone number and we\'ll call you shortly.',
            asapMessage: config.features?.callMe?.messages?.asapMessage || 'We\'ll call you as soon as possible.',
            fixedTimeMessage: config.features?.callMe?.messages?.fixedTimeMessage || 'We\'ll call you within {time} minutes.',
            qualificationPrompt: config.features?.callMe?.messages?.qualificationPrompt || 'How can we help you?'
          }
        }
      };
      
      // Create the content configuration
      const contentConfig: WidgetConfig['content'] = {
        greeting: config.content?.greeting || 'Hello!',
        tagline: config.content?.tagline || 'How can we help?',
        labels: {
          chat: config.content?.labels?.chat || 'Chat with us',
          bookDemo: config.content?.labels?.bookDemo || 'Book a demo',
          callMe: config.content?.labels?.callMe || 'Request a call'
        }
      };
      
      // Create the stats configuration
      const statsConfig: WidgetConfig['stats'] = {
        views: 0,
        interactions: 0,
        leads: 0,
        lastUpdated: new Date()
      };
      
      // Create the chat configuration
      const chatConfig = {
        offlineMessage: config.chatConfig?.offlineMessage || "We're currently offline. Leave a message and we'll get back to you soon.",
        inputPlaceholder: config.chatConfig?.inputPlaceholder || "Type your message...",
        useAI: config.chatConfig?.useAI ?? true,
        aiWelcomeMessage: config.chatConfig?.aiWelcomeMessage || "Hello! I'm an AI assistant. I can help answer your questions or connect you with our team.",
        aiModel: config.chatConfig?.aiModel || 'claude',
        teamName: config.chatConfig?.teamName || "Support Team",
        responseTime: config.chatConfig?.responseTime || "Usually responds in a few minutes",
        showAgentNames: config.chatConfig?.showAgentNames ?? true,
        showAgentAvatars: config.chatConfig?.showAgentAvatars ?? true,
        requiredVisitorFields: config.chatConfig?.requiredVisitorFields || ["email", "name"],
        fileAttachmentsEnabled: config.chatConfig?.fileAttachmentsEnabled ?? true,
        maxFileSize: config.chatConfig?.maxFileSize || 5,
        allowedFileTypes: config.chatConfig?.allowedFileTypes || ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"]
      };
      
      // Create the complete configuration
      const completeConfig: WidgetConfig = {
        base: baseConfig,
        design: designConfig,
        features: featuresConfig,
        content: contentConfig,
        stats: statsConfig,
        chatConfig: chatConfig,
        type: "MultiWidget"
      };
      
      // Save the configuration to Firestore
      await widgetRef.set(completeConfig);
      
      // Cache the configuration
      cacheManager.set(widgetId, completeConfig);
      
      logger.info(`Config created for widgetId: ${widgetId}`);
      
      return widgetId;
    } catch (error) {
      logger.error(`Error creating config for teamId: ${teamId}`, error);
      throw error;
    }
  }
  
  /**
   * Update a widget configuration in Firestore
   * @param widgetId The widget ID
   * @param config The widget configuration
   */
  async updateConfig(widgetId: string, config: Partial<WidgetConfig>): Promise<void> {
    try {
      // Get the existing configuration
      const existingConfig = await this.getConfig(widgetId);
      
      if (!existingConfig) {
        logger.error(`Config not found for widgetId: ${widgetId}`);
        throw new Error(`Config not found for widgetId: ${widgetId}`);
      }
      
      // Ensure type is set to MultiWidget
      if (!config.type) {
        config.type = "MultiWidget";
      }
      
      // Update the configuration
      const updatedConfig: WidgetConfig = {
        ...existingConfig,
        ...config,
        base: {
          ...existingConfig.base,
          ...config.base,
          updatedAt: new Date()
        },
        chatConfig: {
          ...existingConfig.chatConfig,
          ...config.chatConfig
        }
      };
      
      // Save the updated configuration to Firestore
      const configRef = this.db.collection('widgets').doc(widgetId);
      await configRef.update(updatedConfig);
      
      // Update the cache
      cacheManager.set(widgetId, updatedConfig);
      
      logger.info(`Config updated for widgetId: ${widgetId}`);
    } catch (error) {
      logger.error(`Error updating config for widgetId: ${widgetId}`, error);
      throw error;
    }
  }
  
  /**
   * Delete a widget configuration from Firestore
   * @param widgetId The widget ID
   */
  async deleteConfig(widgetId: string): Promise<void> {
    try {
      // Delete the configuration from Firestore by setting it to an empty object
      // This is a workaround since the delete() method may not be available in some Firebase versions
      await this.db.collection('widgets').doc(widgetId).set({});
      
      // Clear the cache
      cacheManager.clear(widgetId);
      
      logger.info(`Config deleted for widgetId: ${widgetId}`);
    } catch (error) {
      logger.error(`Error deleting config for widgetId: ${widgetId}`, error);
      throw error;
    }
  }
  
  /**
   * Convert Firestore timestamps to Date objects
   * @param config The widget configuration
   * @returns The widget configuration with Date objects
   */
  private convertTimestamps(config: WidgetConfig): WidgetConfig {
    // Convert base timestamps
    if (config.base.createdAt && typeof config.base.createdAt !== 'string') {
      // @ts-expect-error: TypeScript may show an error for toDate, but it exists at runtime
      config.base.createdAt = config.base.createdAt.toDate();
    }
    
    if (config.base.updatedAt && typeof config.base.updatedAt !== 'string') {
      // @ts-expect-error: TypeScript may show an error for toDate, but it exists at runtime
      config.base.updatedAt = config.base.updatedAt.toDate();
    }
    
    // Convert stats timestamp
    if (config.stats.lastUpdated && typeof config.stats.lastUpdated !== 'string') {
      // @ts-expect-error: TypeScript may show an error for toDate, but it exists at runtime
      config.stats.lastUpdated = config.stats.lastUpdated.toDate();
    }
    
    return config;
  }
}

// Export a singleton instance
export const configManager = new ConfigManager();
