import React, { useState } from 'react';
import { 
  ScreenContainer, 
  HeaderSection, 
  Greeting, 
  Tagline, 
  ContentSection, 
  ActionCard, 
  ActionTitle, 
  ActionIcon,
  NavSection, 
  NavItem, 
  NavIcon, 
  NavText,
  FadeIn,
  SlideUp,
  PromotionalSection,
  PromotionalCard,
  PromotionalImage,
  PromotionalContent,
  PromotionalTitle,
  PromotionalDescription,
  QuickResponseOptions,
  QuickResponseButton
} from '../styles/styled-components';
import { WidgetConfig } from '../../../types/widget/config.types';
import { trackInteraction } from '../../../services/analytics';

interface HomeScreenProps {
  config: WidgetConfig;
  onNavigate: (screen: string) => void;
}

/**
 * HomeScreen component that displays the main menu of the widget
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ config, onNavigate }) => {
  const { design, content, features } = config;
  const [showPromotion, setShowPromotion] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  
  // Handle navigation to a specific screen
  const handleNavigate = (screen: string) => {
    trackInteraction('navigate', { screen });
    
    if (screen === 'chat') {
      setShowQuickResponses(true);
    } else {
      onNavigate(screen);
    }
  };
  
  // Handle quick response selection
  const handleQuickResponse = (response: string) => {
    trackInteraction('quick_response', { response });
    
    // Map quick responses to appropriate screens
    if (response.toLowerCase().includes('chat') || response.toLowerCase().includes('expert')) {
      onNavigate('chat');
    } else if (response.toLowerCase().includes('demo') || response.toLowerCase().includes('learn')) {
      onNavigate('book-demo');
    } else if (response.toLowerCase().includes('support') || response.toLowerCase().includes('customer')) {
      onNavigate('call-me');
    }
  };
  
  // Toggle promotional section
  const togglePromotion = () => {
    setShowPromotion(!showPromotion);
    trackInteraction('toggle_promotion', { visible: !showPromotion });
  };
  
  return (
    <ScreenContainer design={design}>
      <HeaderSection design={design} useGradient={false}>
        <FadeIn delay={0.1}>
          <Greeting>Hey 👋</Greeting>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Tagline>How can we help?</Tagline>
        </FadeIn>
      </HeaderSection>
      
      <PromotionalSection design={design} isVisible={showPromotion}>
        <PromotionalCard 
          href="https://example.com/report" 
          target="_blank"
          design={design}
        >
          <PromotionalImage 
            src="https://via.placeholder.com/600x200" 
            alt="Promotional content" 
          />
          <PromotionalContent>
            <PromotionalTitle design={design}>
              2025 Customer Service Transformation Report
            </PromotionalTitle>
            <PromotionalDescription>
              Learn how leading companies are transforming their customer service
            </PromotionalDescription>
          </PromotionalContent>
        </PromotionalCard>
      </PromotionalSection>
      
      <ContentSection>
        {!showQuickResponses ? (
          <SlideUp delay={0.3}>
            <ActionCard 
              design={design} 
              onClick={() => handleNavigate('chat')}
            >
              <ActionTitle design={design}>Start a chat</ActionTitle>
              <ActionIcon design={design}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM13 17H11V15H13V17ZM15.07 9.25L14.17 10.17C13.45 10.9 13 11.5 13 13H11V12.5C11 11.4 11.45 10.4 12.17 9.67L13.41 8.41C13.78 8.05 14 7.55 14 7C14 5.9 13.1 5 12 5C10.9 5 10 5.9 10 7H8C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7C16 7.88 15.64 8.68 15.07 9.25Z" fill="currentColor"/>
                </svg>
              </ActionIcon>
            </ActionCard>
          </SlideUp>
        ) : (
          <QuickResponseOptions>
            <SlideUp delay={0.1}>
              <QuickResponseButton 
                design={design}
                onClick={() => handleQuickResponse('Chat with a product expert')}
              >
                Chat with a product expert
              </QuickResponseButton>
            </SlideUp>
            
            <SlideUp delay={0.2}>
              <QuickResponseButton 
                design={design}
                onClick={() => handleQuickResponse('Learn more about our product')}
              >
                Learn more about our product
              </QuickResponseButton>
            </SlideUp>
            
            <SlideUp delay={0.3}>
              <QuickResponseButton 
                design={design}
                onClick={() => handleQuickResponse('I\'m a customer and need support')}
              >
                I'm a customer and need support
              </QuickResponseButton>
            </SlideUp>
          </QuickResponseOptions>
        )}
      </ContentSection>
      
      <NavSection design={design}>
        {features.chat.enabled && (
          <SlideUp delay={0.4}>
            <NavItem 
              design={design} 
              onClick={() => handleNavigate('chat')}
            >
              <NavIcon design={design} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM13 17H11V15H13V17ZM15.07 9.25L14.17 10.17C13.45 10.9 13 11.5 13 13H11V12.5C11 11.4 11.45 10.4 12.17 9.67L13.41 8.41C13.78 8.05 14 7.55 14 7C14 5.9 13.1 5 12 5C10.9 5 10 5.9 10 7H8C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7C16 7.88 15.64 8.68 15.07 9.25Z" fill="currentColor"/>
              </NavIcon>
              <NavText design={design}>{content.labels.chat}</NavText>
            </NavItem>
          </SlideUp>
        )}
        
        {features.bookDemo.enabled && (
          <SlideUp delay={0.5}>
            <NavItem 
              design={design} 
              onClick={() => handleNavigate('book-demo')}
            >
              <NavIcon design={design} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V15H12V13Z" fill="currentColor"/>
              </NavIcon>
              <NavText design={design}>{content.labels.bookDemo}</NavText>
            </NavItem>
          </SlideUp>
        )}
        
        {features.callMe.enabled && (
          <SlideUp delay={0.6}>
            <NavItem 
              design={design} 
              onClick={() => handleNavigate('call-me')}
            >
              <NavIcon design={design} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="currentColor"/>
              </NavIcon>
              <NavText design={design}>{content.labels.callMe}</NavText>
            </NavItem>
          </SlideUp>
        )}
      </NavSection>
    </ScreenContainer>
  );
};

export default HomeScreen;
