import { useState } from "react";
import { ChatWidget } from "./chat-widget-types";
import { MessageSquare, X, Paperclip, Send, User, Bot } from "lucide-react";

interface ChatWidgetPreviewProps {
  widget: ChatWidget;
  state: 'initial' | 'expanded' | 'conversation';
  device: 'desktop' | 'mobile';
}

export function ChatWidgetPreview({ widget, state, device }: ChatWidgetPreviewProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'agent' | 'ai';
    timestamp: Date;
    isInternal?: boolean;
  }>>([
    {
      id: '1',
      text: widget.chatConfig.welcomeMessage,
      sender: 'agent',
      timestamp: new Date(Date.now() - 60000 * 5)
    },
    {
      id: '2',
      text: widget.chatConfig.useAI ? widget.chatConfig.aiWelcomeMessage : "How can I help you today?",
      sender: widget.chatConfig.useAI ? 'ai' : 'agent',
      timestamp: new Date(Date.now() - 60000 * 4)
    },
    {
      id: '3',
      text: "Hi there! I'm interested in your product. Can you tell me more about pricing?",
      sender: 'user',
      timestamp: new Date(Date.now() - 60000 * 3)
    },
    {
      id: '4',
      text: "Of course! Our pricing starts at $49/month for the basic plan. Would you like me to send you our full pricing details?",
      sender: widget.chatConfig.useAI ? 'ai' : 'agent',
      timestamp: new Date(Date.now() - 60000 * 2)
    },
    {
      id: '5',
      text: "That would be great, thanks!",
      sender: 'user',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '6',
      text: "I've sent you an email with our pricing details. Is there anything else you'd like to know?",
      sender: 'agent',
      timestamp: new Date(),
      isInternal: false
    },
    {
      id: '7',
      text: "@marketing This lead is interested in our enterprise plan. Can you follow up with them?",
      sender: 'agent',
      timestamp: new Date(),
      isInternal: true
    }
  ]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get position styles based on widget position
  const getPositionStyles = () => {
    switch (widget.design.position) {
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      default:
        return { bottom: '20px', right: '20px' };
    }
  };

  // Get width based on device
  const getWidth = () => {
    return device === 'desktop' ? '360px' : '300px';
  };

  // Get height based on device
  const getHeight = () => {
    return device === 'desktop' ? '500px' : '400px';
  };

  // Render initial state (chat button)
  if (state === 'initial') {
    return (
      <div 
        className="absolute"
        style={getPositionStyles()}
      >
        <button
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
          style={{
            backgroundColor: widget.design.primaryColor,
            color: widget.design.secondaryColor,
          }}
        >
          <MessageSquare size={24} />
        </button>
      </div>
    );
  }

  // Render expanded state (chat window)
  return (
    <div 
      className="absolute flex flex-col rounded-lg shadow-lg overflow-hidden"
      style={{
        ...getPositionStyles(),
        width: getWidth(),
        height: getHeight(),
        backgroundColor: widget.design.theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: widget.design.theme === 'dark' ? '#ffffff' : '#1a1a1a',
        borderRadius: `${widget.design.borderRadius}px`,
        fontFamily: widget.design.fontFamily,
      }}
    >
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between p-4"
        style={{
          backgroundColor: widget.design.primaryColor,
          color: widget.design.secondaryColor,
        }}
      >
        <div>
          <h3 className="font-semibold text-base">{widget.content.title}</h3>
          <p className="text-xs opacity-90">{widget.content.description}</p>
        </div>
        <button className="p-1 rounded-full hover:bg-black/10">
          <X size={18} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{
        backgroundColor: widget.design.theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
      }}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${msg.isInternal ? 'opacity-70' : ''}`}
          >
            {msg.sender !== 'user' && widget.chatConfig.showAgentAvatars && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                style={{
                  backgroundColor: msg.sender === 'ai' ? '#6366f1' : widget.design.primaryColor,
                  color: widget.design.secondaryColor,
                }}
              >
                {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
            )}
            
            <div className={`max-w-[70%] ${msg.isInternal ? 'border border-yellow-500 bg-yellow-50 text-yellow-800' : ''}`}>
              {widget.chatConfig.showAgentNames && msg.sender !== 'user' && !msg.isInternal && (
                <div className="text-xs font-medium mb-1">
                  {msg.sender === 'ai' ? 'AI Assistant' : widget.chatConfig.teamName}
                </div>
              )}
              
              {msg.isInternal && (
                <div className="text-xs font-medium mb-1 text-yellow-700">
                  Internal Note
                </div>
              )}
              
              <div 
                className={`p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : msg.isInternal
                      ? 'bg-transparent'
                      : 'bg-card'
                }`}
                style={
                  msg.sender === 'user' 
                    ? { backgroundColor: widget.design.primaryColor, color: widget.design.secondaryColor }
                    : msg.isInternal
                      ? {}
                      : {}
                }
              >
                <p className="text-sm">{msg.text}</p>
              </div>
              
              <div className="text-xs text-muted-foreground mt-1">
                {formatTime(msg.timestamp)}
              </div>
            </div>
            
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t" style={{
        borderColor: widget.design.theme === 'dark' ? '#3a3a3a' : '#e5e5e5',
      }}>
        <div className="flex items-center">
          {widget.chatConfig.fileAttachmentsEnabled && (
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Paperclip size={18} />
            </button>
          )}
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={widget.chatConfig.inputPlaceholder}
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm"
          />
          
          <button 
            className="p-2 rounded-full"
            style={{
              backgroundColor: widget.design.primaryColor,
              color: widget.design.secondaryColor,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
