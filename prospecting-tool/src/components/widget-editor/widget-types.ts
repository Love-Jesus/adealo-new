// Widget data type
export interface Widget {
  id?: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt?: Date;
  updatedAt?: Date;
  previewState?: 'initial' | 'expanded' | 'confirmation';
  stats?: {
    views: number;
    interactions: number;
    leads: number;
  };
  design: {
    theme: string;
    position: string;
    primaryColor: string;
    secondaryColor: string;
    borderRadius: number;
    shadow: string;
    fontFamily: string;
    animation: string;
    media?: {
      type: 'image' | 'video';
      url: string;
    };
  };
  content: {
    title: string;
    description: string;
    ctaText: string;
    thankYouMessage: string;
    hostName?: string;
    hostTitle?: string;
    hostPhoto?: string;
    // Support chat specific fields
    welcomeMessage?: string;
    quickResponses?: string[];
  };
  behavior: {
    trigger: 'time' | 'scroll' | 'exit';
    delay: number;
    frequency: 'once' | 'always' | 'custom';
    displayOnMobile: boolean;
    scrollPercentage?: number;
  };
  integration: {
    calendlyUrl: string;
    collectLeadData: boolean;
    requiredFields: string[];
    // Support chat specific fields
    supportTeamId?: string;
    collectVisitorInfo?: boolean;
  };
  // Chat configuration
  chatConfig?: {
    // General chat settings
    offlineMessage?: string;
    inputPlaceholder?: string;
    
    // AI settings
    useAI?: boolean;
    aiWelcomeMessage?: string;
    aiModel?: 'claude' | 'custom';
    aiApiKey?: string;
    
    // Team settings
    teamName?: string;
    responseTime?: string;
    showAgentNames?: boolean;
    showAgentAvatars?: boolean;
    
    // Advanced settings
    requiredVisitorFields?: string[];
    fileAttachmentsEnabled?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
  };
}

// Widget type
export type WidgetType = 'MultiWidget';

// Default widget template
export const defaultWidget: Widget = {
  name: "New MultiWidget",
  type: "MultiWidget",
  status: "draft",
  design: {
    theme: "light",
    position: "bottom-right",
    primaryColor: "#6e8efb", // Intercom-style blue
    secondaryColor: "#FFFFFF",
    borderRadius: 16,
    shadow: "md",
    fontFamily: "Inter",
    animation: "slide-up",
    media: undefined
  },
  content: {
    title: "Chat with Our Team",
    description: "We're here to help you succeed",
    ctaText: "Get Started",
    thankYouMessage: "Thanks for reaching out! We'll be in touch soon.",
    hostName: "Support Team",
    hostTitle: "Customer Success",
    hostPhoto: "",
    welcomeMessage: "Hi there! How can we help you today?",
    quickResponses: [
      "Book a demo",
      "Chat with an expert",
      "Get support"
    ],
  },
  behavior: {
    trigger: "time",
    delay: 5,
    frequency: "once",
    displayOnMobile: true,
  },
  integration: {
    calendlyUrl: "",
    collectLeadData: true,
    requiredFields: ["email", "name"],
    collectVisitorInfo: true,
  },
  chatConfig: {
    offlineMessage: "We're currently offline. Leave a message and we'll get back to you soon.",
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
    allowedFileTypes: ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"]
  }
};
