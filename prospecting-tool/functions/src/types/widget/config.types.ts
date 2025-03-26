/**
 * Widget Configuration Types
 * These types define the structure of the widget configuration.
 */

/**
 * Widget Configuration
 * The main configuration object for the widget.
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
 * Widget Base Configuration
 * Basic information about the widget.
 */
export interface WidgetBaseConfig {
  widgetId: string;
  teamId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Widget Design Configuration
 * Visual appearance of the widget.
 */
export interface WidgetDesignConfig {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'light' | 'dark';
  borderRadius?: number;
  fontFamily?: string;
}

/**
 * Widget Features Configuration
 * Features enabled in the widget.
 */
export interface WidgetFeaturesConfig {
  chat: ChatFeatureConfig;
  bookDemo: BookDemoFeatureConfig;
  callMe: CallMeFeatureConfig;
}

/**
 * Chat Feature Configuration
 * Configuration for the chat feature.
 */
export interface ChatFeatureConfig {
  enabled: boolean;
  greeting?: string;
  teamName?: string;
  agentName?: string;
  agentAvatar?: string;
}

/**
 * Book Demo Feature Configuration
 * Configuration for the book demo feature.
 */
export interface BookDemoFeatureConfig {
  enabled: boolean;
  calendlyUrl?: string;
  title?: string;
  description?: string;
}

/**
 * Call Me Feature Configuration
 * Configuration for the call me feature.
 */
export interface CallMeFeatureConfig {
  enabled: boolean;
  mode?: 'single' | 'team';
  responseType?: 'asap' | 'fixed-time';
  responseTime?: number;
  qualificationEnabled?: boolean;
  qualificationOptions?: QualificationOption[];
  team?: {
    members: TeamMember[];
    displayMode?: 'grid' | 'list';
  };
  messages?: {
    title?: string;
    description?: string;
    asapMessage?: string;
    fixedTimeMessage?: string;
    qualificationPrompt?: string;
  };
}

/**
 * Qualification Option
 * Option for qualifying a call request.
 */
export interface QualificationOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Team Member
 * Member of the team that can be contacted.
 */
export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

/**
 * Widget Content Configuration
 * Text content of the widget.
 */
export interface WidgetContentConfig {
  greeting: string;
  tagline: string;
  labels: {
    chat: string;
    bookDemo: string;
    callMe: string;
  };
}

/**
 * Widget Statistics
 * Usage statistics for the widget.
 */
export interface WidgetStats {
  views: number;
  interactions: number;
  leads: number;
  lastUpdated: string | Date;
}

/**
 * Chat Configuration
 * Configuration for the chat feature.
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
}
