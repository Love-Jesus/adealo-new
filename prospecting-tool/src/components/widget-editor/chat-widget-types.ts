import { Widget } from './widget-types';

// This file is kept for backward compatibility
// The chatConfig has been moved to the Widget interface in widget-types.ts

// Default MultiWidget with chat configuration
export const defaultChatWidget: Widget = {
  name: "New MultiWidget",
  type: "MultiWidget",
  status: "draft",
  design: {
    theme: "light",
    position: "bottom-right",
    primaryColor: "#3A36DB",
    secondaryColor: "#FFFFFF",
    borderRadius: 8,
    shadow: "md",
    fontFamily: "Inter",
    animation: "slide-up",
  },
  content: {
    title: "Chat with Us",
    description: "We're here to help",
    ctaText: "Start Chat",
    thankYouMessage: "Thanks for reaching out!",
    hostName: "Support Team",
    hostTitle: "Customer Support",
    welcomeMessage: "👋 Hi there! How can we help you today?",
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
    supportTeamId: "",
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

// For backward compatibility
export type ChatWidget = Widget;
