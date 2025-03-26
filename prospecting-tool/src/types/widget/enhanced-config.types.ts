/**
 * Enhanced Widget Configuration Types
 * These types define the structure of the premium widget configuration
 */

/**
 * Base configuration for the widget
 */
export interface EnhancedWidgetBaseConfig {
  widgetId: string;
  teamId: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gradient configuration
 */
export interface GradientConfig {
  type: 'linear' | 'radial';
  direction?: string; // e.g., "135deg" for linear
  colors: string[]; // Array of color stops
}

/**
 * Shadow configuration with more detailed options
 */
export interface ShadowConfig {
  type: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  color?: string;
}

/**
 * Enhanced design configuration for the widget
 */
export interface EnhancedWidgetDesignConfig {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent?: string;
    gradient?: GradientConfig;
  };
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'light' | 'dark' | 'custom';
  borderRadius: number;
  shadow: string | ShadowConfig;
  fontFamily: string;
  animation: {
    type: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'scale' | 'none';
    duration: number; // in ms
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  };
  launcher: {
    size: number;
    shape: 'circle' | 'rounded-square';
    useGradient: boolean;
    pulseAnimation: boolean;
  };
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

/**
 * Qualification option for lead qualification
 */
export interface EnhancedQualificationOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Team member configuration
 */
export interface EnhancedTeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  availability?: {
    start: string; // Time in HH:mm format
    end: string;
  };
  status?: 'online' | 'offline' | 'away';
}

/**
 * Chat feature configuration
 */
export interface EnhancedChatFeatureConfig {
  enabled: boolean;
  greeting: string;
  teamName: string;
  agentName: string;
  agentAvatar?: string;
  typingIndicator: boolean;
  showTimestamps: boolean;
  showReadReceipts: boolean;
  messageHistory: boolean;
  offlineMessage: string;
  inputPlaceholder: string;
}

/**
 * Book Demo feature configuration
 */
export interface EnhancedBookDemoFeatureConfig {
  enabled: boolean;
  calendlyUrl: string;
  title: string;
  description: string;
  showTeamMembers: boolean;
  teamMembers?: EnhancedTeamMember[];
  preQualification: boolean;
  qualificationQuestions?: string[];
}

/**
 * Call Me feature configuration
 */
export interface EnhancedCallMeFeatureConfig {
  enabled: boolean;
  mode: 'single' | 'team';
  responseType: 'fixed' | 'asap';
  responseTime?: number; // Minutes if fixed time
  qualificationEnabled: boolean;
  qualificationOptions: EnhancedQualificationOption[];
  team: {
    members: EnhancedTeamMember[];
    displayMode: 'grid' | 'carousel';
  };
  messages: {
    title: string;
    description: string;
    asapMessage: string;
    fixedTimeMessage: string;
    qualificationPrompt: string;
    successMessage: string;
  };
}

/**
 * Features configuration for the widget
 */
export interface EnhancedWidgetFeaturesConfig {
  chat: EnhancedChatFeatureConfig;
  bookDemo: EnhancedBookDemoFeatureConfig;
  callMe: EnhancedCallMeFeatureConfig;
}

/**
 * Content configuration for the widget
 */
export interface EnhancedWidgetContentConfig {
  greeting: string;
  tagline: string;
  labels: {
    chat: string;
    bookDemo: string;
    callMe: string;
  };
  quickResponses?: string[];
}

/**
 * Statistics for the widget
 */
export interface EnhancedWidgetStats {
  views: number;
  interactions: number;
  leads: number;
  lastUpdated: Date;
}

/**
 * Chat configuration for the widget
 */
export interface EnhancedChatConfig {
  offlineMessage: string;
  inputPlaceholder: string;
  useAI: boolean;
  aiWelcomeMessage?: string;
  aiModel?: 'claude' | 'custom';
  aiApiKey?: string;
  teamName: string;
  responseTime: string;
  showAgentNames: boolean;
  showAgentAvatars: boolean;
  requiredVisitorFields: string[];
  fileAttachmentsEnabled: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  typingIndicator: boolean;
  showTimestamps: boolean;
  showReadReceipts: boolean;
}

/**
 * Complete enhanced widget configuration
 */
export interface EnhancedWidgetConfig {
  base: EnhancedWidgetBaseConfig;
  design: EnhancedWidgetDesignConfig;
  features: EnhancedWidgetFeaturesConfig;
  content: EnhancedWidgetContentConfig;
  stats: EnhancedWidgetStats;
  chatConfig: EnhancedChatConfig;
  type: 'MultiWidget';
}

/**
 * Default enhanced widget configuration
 */
export const defaultEnhancedWidget: EnhancedWidgetConfig = {
  base: {
    widgetId: '',
    teamId: '',
    name: 'New Premium Widget',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  design: {
    colors: {
      primary: '#6e8efb',
      secondary: '#4a6cf7',
      text: '#333333',
      background: '#ffffff',
      accent: '#ff5733',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#6e8efb', '#4a6cf7']
      }
    },
    position: 'bottom-right',
    theme: 'light',
    borderRadius: 16,
    shadow: {
      type: 'md',
      x: 0,
      y: 4,
      blur: 12,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.2)'
    },
    fontFamily: 'Inter',
    animation: {
      type: 'slide-up',
      duration: 250,
      easing: 'ease-out'
    },
    launcher: {
      size: 60,
      shape: 'circle',
      useGradient: true,
      pulseAnimation: true
    }
  },
  features: {
    chat: {
      enabled: true,
      greeting: 'Hi there! 👋',
      teamName: 'Our Team',
      agentName: 'Support',
      agentAvatar: '',
      typingIndicator: true,
      showTimestamps: true,
      showReadReceipts: true,
      messageHistory: true,
      offlineMessage: "We're currently offline. Please leave a message and we'll get back to you soon.",
      inputPlaceholder: "Type your message..."
    },
    bookDemo: {
      enabled: true,
      calendlyUrl: 'https://calendly.com/your-company/30min',
      title: 'Book a Demo',
      description: 'Schedule a time with our team to see our product in action.',
      showTeamMembers: true,
      preQualification: false
    },
    callMe: {
      enabled: true,
      mode: 'single',
      responseType: 'asap',
      responseTime: 5,
      qualificationEnabled: true,
      qualificationOptions: [
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
        members: [
          {
            id: 'agent1',
            name: 'John Doe',
            role: 'Sales Representative',
            avatar: '',
            status: 'online'
          },
          {
            id: 'agent2',
            name: 'Jane Smith',
            role: 'Customer Support',
            avatar: '',
            status: 'online'
          }
        ],
        displayMode: 'grid'
      },
      messages: {
        title: 'Request a Call',
        description: 'Enter your phone number and we\'ll call you shortly.',
        asapMessage: 'We\'ll call you as soon as possible.',
        fixedTimeMessage: 'We\'ll call you within {time} minutes.',
        qualificationPrompt: 'How can we help you?',
        successMessage: 'Thanks! We\'ll call you shortly.'
      }
    }
  },
  content: {
    greeting: 'Hello!',
    tagline: 'How can we help?',
    labels: {
      chat: 'Chat with us',
      bookDemo: 'Book a demo',
      callMe: 'Request a call'
    },
    quickResponses: [
      'Book a demo',
      'Chat with an expert',
      'Get support'
    ]
  },
  stats: {
    views: 0,
    interactions: 0,
    leads: 0,
    lastUpdated: new Date()
  },
  chatConfig: {
    offlineMessage: "We're currently offline. Please leave a message and we'll get back to you soon.",
    inputPlaceholder: "Type your message...",
    useAI: true,
    aiWelcomeMessage: "Hello! I'm an AI assistant. I can help answer your questions or connect you with our team.",
    aiModel: 'claude',
    teamName: "Support Team",
    responseTime: "Usually responds in a few minutes",
    showAgentNames: true,
    showAgentAvatars: true,
    requiredVisitorFields: ["email", "name"],
    fileAttachmentsEnabled: true,
    maxFileSize: 5, // MB
    allowedFileTypes: ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"],
    typingIndicator: true,
    showTimestamps: true,
    showReadReceipts: true
  },
  type: 'MultiWidget'
};
