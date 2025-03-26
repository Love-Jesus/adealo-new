import { Widget } from "./widget-types";
import { Calendar, MessageSquare, User, Send, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

interface WidgetPreviewProps {
  widget: Widget;
  state: 'initial' | 'expanded' | 'confirmation';
  device: 'desktop' | 'mobile';
}

export function WidgetPreview({ widget, state, device }: WidgetPreviewProps) {
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  
  // Add pulse animation after a delay
  useEffect(() => {
    if (state === 'initial') {
      const timer = setTimeout(() => {
        setIsPulsing(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setIsPulsing(false);
    }
  }, [state]);
  
  // Determine position classes based on widget position
  const getPositionClasses = () => {
    switch (widget.design.position) {
      case 'bottom-right':
        return 'bottom-5 right-5';
      case 'bottom-left':
        return 'bottom-5 left-5';
      case 'top-right':
        return 'top-5 right-5';
      case 'top-left':
        return 'top-5 left-5';
      default:
        return 'bottom-5 right-5';
    }
  };
  
  // Render initial state (button only)
  const renderInitialState = () => {
    // Create a gradient style using primary and secondary colors
    const gradientStyle = {
      background: `linear-gradient(135deg, ${widget.design.primaryColor}, ${widget.design.secondaryColor || widget.design.primaryColor})`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      animation: isPulsing ? 'pulse 2s infinite' : 'none'
    };
    
    return (
      <div className="relative">
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}
        </style>
        <button
          className="flex items-center justify-center w-[60px] h-[60px] rounded-full transition-transform hover:scale-105"
          style={gradientStyle}
        >
          <MessageSquare className="h-7 w-7 text-white" />
        </button>
      </div>
    );
  };
  
  // Render expanded state (full widget)
  const renderExpandedState = () => {
    return renderIntercomWidget();
  };
  
  // Render Intercom-style widget
  const renderIntercomWidget = () => {
    // Create a gradient style for header
    const headerGradientStyle = {
      background: `linear-gradient(135deg, ${widget.design.primaryColor}, ${widget.design.secondaryColor || widget.design.primaryColor})`
    };
    
    return (
      <div 
        className={`
          rounded-[16px] shadow-xl overflow-hidden flex flex-col
          ${device === 'desktop' ? 'w-[380px]' : 'w-full'}
          h-[600px] max-h-[80vh]
          transform transition-all duration-250 ease-out
        `}
        style={{ 
          backgroundColor: widget.design.theme === 'dark' ? '#1F2937' : 'white',
          color: widget.design.theme === 'dark' ? 'white' : '#1F2937',
        }}
      >
        {/* Widget Header */}
        <div 
          className="p-8 flex flex-col justify-end h-[180px]"
          style={headerGradientStyle}
        >
          <h2 className="text-white text-3xl font-normal mb-1.5">
            {'Hello 👋'}
          </h2>
          <h1 className="text-white text-3xl font-semibold mb-4">
            {widget.content.description || 'How can we help?'}
          </h1>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {/* Action Card */}
          <div 
            className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-sm flex items-center justify-between"
          >
            <div className="font-semibold">
              {widget.content.title || 'Ask a question'}
            </div>
            <div style={{ color: widget.design.primaryColor }}>
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          
          {/* Quick Response Options */}
          {(widget.content.quickResponses && widget.content.quickResponses.length > 0) && (
            <div className="space-y-2 py-2">
              {widget.content.quickResponses.map((response, index) => (
                <button
                  key={index}
                  className="block w-full text-left p-3 rounded-md text-sm border transition-colors"
                  style={{ 
                    borderColor: widget.design.primaryColor,
                    color: widget.design.primaryColor,
                    backgroundColor: widget.design.theme === 'dark' ? '#1F2937' : 'white',
                  }}
                >
                  {response}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Navigation Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-3">
            {/* Chat Nav Item */}
            <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50">
              <div style={{ color: widget.design.primaryColor }}>
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="font-medium text-base">
                {widget.content.ctaText || 'Chat with us'}
              </div>
            </div>
            
            {/* Book Demo Nav Item */}
            <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50">
              <div style={{ color: widget.design.primaryColor }}>
                <Calendar className="h-6 w-6" />
              </div>
              <div className="font-medium text-base">
                Book a demo
              </div>
            </div>
            
            {/* Call Me Nav Item */}
            <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50">
              <div style={{ color: widget.design.primaryColor }}>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="font-medium text-base">
                Call me now
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render chat screen
  const renderChatScreen = () => {
    // Create a gradient style for header
    const headerGradientStyle = {
      background: `linear-gradient(135deg, ${widget.design.primaryColor}, ${widget.design.secondaryColor || widget.design.primaryColor})`
    };
    
    return (
      <div 
        className={`
          rounded-[16px] shadow-xl overflow-hidden flex flex-col
          ${device === 'desktop' ? 'w-[380px]' : 'w-full'}
          h-[600px] max-h-[80vh]
        `}
        style={{ 
          backgroundColor: widget.design.theme === 'dark' ? '#1F2937' : 'white',
          color: widget.design.theme === 'dark' ? 'white' : '#1F2937',
        }}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="text-gray-500 text-xl">←</button>
            <div 
              className="h-8 w-8 rounded-md flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: widget.design.primaryColor }}
            >
              {widget.content.hostPhoto ? (
                <img 
                  src={widget.content.hostPhoto} 
                  alt={widget.content.hostName || 'Host'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <div className="font-semibold text-base">
                {widget.content.hostName || 'Support'}
              </div>
              <div className="text-sm text-gray-500">
                Our team can help you
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="text-gray-500">⋯</button>
            <button className="text-gray-500">⤢</button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          {/* Admin Info */}
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="h-7 w-7 rounded-md flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: widget.design.primaryColor }}
            >
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="font-medium text-sm">
              {widget.content.hostName || 'Support'}
            </div>
          </div>
          
          {/* Admin Message */}
          <div 
            className="rounded-2xl rounded-bl-sm p-4 max-w-[70%] bg-gray-200 self-start mr-auto"
          >
            <p className="text-sm">
              {widget.content.welcomeMessage || 'Hi there! How can we help you today?'}
            </p>
            <span className="text-xs block mt-1 text-gray-500">
              10:30 AM
            </span>
          </div>
          
          {/* User Message */}
          <div 
            className="rounded-2xl rounded-br-sm p-4 max-w-[70%] self-end ml-auto"
            style={{ 
              backgroundColor: widget.design.primaryColor,
              color: 'white'
            }}
          >
            <p className="text-sm">
              I'd like to learn more about your product
            </p>
            <span className="text-xs block mt-1 text-white/80">
              10:31 AM
            </span>
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="relative">
            <textarea 
              placeholder="Type your message..." 
              className="w-full p-3 pr-12 rounded-3xl border border-gray-200 text-sm min-h-[54px] max-h-[150px] resize-none focus:outline-none focus:border-blue-400"
              rows={1}
            ></textarea>
            <button
              className="absolute right-3 bottom-3 p-2 rounded-full"
              style={{ backgroundColor: widget.design.primaryColor }}
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render confirmation state
  const renderConfirmationState = () => {
    return (
      <div 
        className={`
          rounded-[16px] shadow-xl overflow-hidden
          ${device === 'desktop' ? 'w-[380px]' : 'w-full'}
        `}
        style={{ 
          backgroundColor: widget.design.theme === 'dark' ? '#1F2937' : 'white',
          color: widget.design.theme === 'dark' ? 'white' : '#1F2937',
        }}
      >
        <div className="p-8 text-center">
          <div 
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
            style={{ 
              background: `linear-gradient(135deg, ${widget.design.primaryColor}, ${widget.design.secondaryColor || widget.design.primaryColor})`,
            }}
          >
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-xl font-semibold mb-3">
            {widget.content.thankYouMessage || 'Thank you!'}
          </h3>
          
          <p 
            className="text-base text-gray-600"
          >
            We'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`absolute ${getPositionClasses()}`}>
      {state === 'initial' && renderInitialState()}
      {state === 'expanded' && renderExpandedState()}
      {state === 'confirmation' && renderConfirmationState()}
    </div>
  );
}
