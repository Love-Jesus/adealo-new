/**
 * Widget Configuration Types
 * These types define the structure of the widget configuration
 */

/**
 * Base configuration for the widget
 */
export interface WidgetBaseConfig {
  widgetId: string;
  teamId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Launcher configuration
 */
export interface LauncherConfig {
  size?: number;
  shape?: 'circle' | 'rounded-square';
  useGradient?: boolean;
  pulseAnimation?: boolean;
}

/**
 * Design configuration for the widget
 */
export interface WidgetDesignConfig {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent?: string;
    gradient?: {
      type: 'linear' | 'radial';
      direction?: string;
      colors: string[];
    };
  };
  position: 'bottom-right' | 'bottom-left';
  theme: 'light' | 'dark';
  borderRadius?: number;
  fontFamily?: string;
  launcher?: LauncherConfig;
  animation?: {
    type?: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'scale' | 'none';
    duration?: number;
    easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  };
}

/**
 * Qualification option for lead qualification
 */
export interface QualificationOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Team member configuration
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  availability?: {
    start: string; // Time in HH:mm format
    end: string;
  };
}

/**
 * Chat feature configuration
 */
export interface ChatFeatureConfig {
  enabled: boolean;
  greeting: string;
  teamName: string;
  agentName: string;
  agentAvatar?: string;
}

/**
 * Book Demo feature configuration
 */
export interface BookDemoFeatureConfig {
  enabled: boolean;
  calendlyUrl: string;
  title: string;
  description: string;
}

/**
 * Call Me feature configuration
 */
export interface CallMeFeatureConfig {
  enabled: boolean;
  mode: 'single' | 'team';
  responseType: 'fixed' | 'asap';
  responseTime?: number; // Minutes if fixed time
  qualificationEnabled: boolean;
  qualificationOptions: QualificationOption[];
  team: {
    members: TeamMember[];
    displayMode: 'grid' | 'carousel';
  };
  messages: {
    title: string;
    description: string;
    asapMessage: string;
    fixedTimeMessage: string;
    qualificationPrompt: string;
  };
}

/**
 * Features configuration for the widget
 */
export interface WidgetFeaturesConfig {
  chat: ChatFeatureConfig;
  bookDemo: BookDemoFeatureConfig;
  callMe: CallMeFeatureConfig;
}

/**
 * Content configuration for the widget
 */
export interface WidgetContentConfig {
  greeting: string;
  tagline: string;
  labels: {
    chat: string;
    bookDemo: string;
    callMe: string;
  };
  quickResponses?: string[];
  promotionalContent?: {
    enabled: boolean;
    title: string;
    description: string;
    imageUrl?: string;
    linkUrl?: string;
  };
}

/**
 * Statistics for the widget
 */
export interface WidgetStats {
  views: number;
  interactions: number;
  leads: number;
  lastUpdated: Date;
}

/**
 * Chat configuration for the widget
 */
export interface ChatConfig {
  offlineMessage?: string;
  inputPlaceholder?: string;
  useAI?: boolean;
  aiWelcomeMessage?: string;
  aiModel?: 'claude' | 'custom';
  aiApiKey?: string;
  teamName?: string;
  responseTime?: string;
  showAgentNames?: boolean;
  showAgentAvatars?: boolean;
  requiredVisitorFields?: string[];
  fileAttachmentsEnabled?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  typingIndicator?: boolean;
  showTimestamps?: boolean;
  showReadReceipts?: boolean;
}

/**
 * Complete widget configuration
 */
export interface WidgetConfig {
  base: WidgetBaseConfig;
  design: WidgetDesignConfig;
  features: WidgetFeaturesConfig;
  content: WidgetContentConfig;
  stats: WidgetStats;
  chatConfig?: ChatConfig;
  type?: string;
}

/**
 * Widget status enum
 */
export type WidgetStatus = 'active' | 'inactive';
