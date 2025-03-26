import React, { useState, useRef, useEffect } from 'react';
import { 
  ScreenContainer, 
  Header, 
  HeaderLeft, 
  BackButton, 
  HeaderTitle, 
  HeaderSubtitle,
  HeaderInfo,
  ChatMessages, 
  ChatInputContainer, 
  ChatInput, 
  Button, 
  MessageBubble, 
  AdminInfo, 
  AdminName, 
  Avatar,
  MessageTimestamp,
  TypingIndicator,
  SlideUp
} from '../styles/styled-components';
import { WidgetConfig } from '../../../types/widget/config.types';
import { trackInteraction } from '../../../services/analytics';

interface ChatScreenProps {
  config: WidgetConfig;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  isAdmin: boolean;
  timestamp: Date;
}

/**
 * ChatScreen component that displays the chat interface
 */
const ChatScreen: React.FC<ChatScreenProps> = ({ config, onBack }) => {
  const { design, features, chatConfig } = config;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Show typing indicator and welcome message on initial load
  useEffect(() => {
    // Show typing indicator
    setIsTyping(true);
    
    // After a delay, add the welcome message
    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages([
        {
          id: '1',
          text: 'Hi 👋 How can I help you?',
          isAdmin: true,
          timestamp: new Date()
        }
      ]);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle send message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isAdmin: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    trackInteraction('send_message', { content: inputValue });
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate response after a delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Add admin response
      const adminMessage: Message = {
        id: `admin-${Date.now()}`,
        text: 'Thank you for your message. One of our team members will get back to you shortly.',
        isAdmin: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, adminMessage]);
    }, 2000);
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <ScreenContainer design={design}>
      <Header design={design}>
        <HeaderLeft>
          <BackButton design={design} onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
            </svg>
          </BackButton>
          <HeaderInfo>
            <HeaderTitle design={design}>{features.chat.teamName}</HeaderTitle>
            <HeaderSubtitle>
              {chatConfig?.responseTime || 'Usually responds in a few minutes'}
            </HeaderSubtitle>
          </HeaderInfo>
        </HeaderLeft>
      </Header>
      
      <ChatMessages design={design}>
        {messages.map((message) => (
          <SlideUp key={message.id} delay={0.1}>
            {message.isAdmin && (
              <AdminInfo>
                <Avatar design={design} size="small">
                  {features.chat.agentAvatar ? (
                    <img src={features.chat.agentAvatar} alt={features.chat.agentName} />
                  ) : (
                    features.chat.agentName.charAt(0)
                  )}
                </Avatar>
                <AdminName design={design}>{features.chat.agentName}</AdminName>
              </AdminInfo>
            )}
            <MessageBubble design={design} isAdmin={message.isAdmin}>
              {message.text}
              {chatConfig?.showTimestamps && (
                <MessageTimestamp>
                  {formatTimestamp(message.timestamp)}
                </MessageTimestamp>
              )}
            </MessageBubble>
          </SlideUp>
        ))}
        
        {isTyping && (
          <SlideUp delay={0.1}>
            <AdminInfo>
              <Avatar design={design} size="small">
                {features.chat.agentAvatar ? (
                  <img src={features.chat.agentAvatar} alt={features.chat.agentName} />
                ) : (
                  features.chat.agentName.charAt(0)
                )}
              </Avatar>
              <AdminName design={design}>{features.chat.agentName}</AdminName>
            </AdminInfo>
            <TypingIndicator>
              <span></span>
              <span></span>
              <span></span>
            </TypingIndicator>
          </SlideUp>
        )}
        
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      <ChatInputContainer design={design}>
        <ChatInput
          design={design}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={chatConfig?.inputPlaceholder || "Type your message..."}
          rows={1}
        />
        <Button 
          design={design} 
          onClick={handleSendMessage}
          style={{ marginTop: '8px' }}
          disabled={!inputValue.trim()}
        >
          Send
        </Button>
      </ChatInputContainer>
    </ScreenContainer>
  );
};

export default ChatScreen;
