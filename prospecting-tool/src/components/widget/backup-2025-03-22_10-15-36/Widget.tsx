import React, { useState } from 'react';
import { WidgetConfig } from '../../types/widget/config.types';
import { WidgetContainer } from './styles/styled-components';
import LauncherButton from './components/LauncherButton';
import HomeScreen from './components/HomeScreen';
import ChatScreen from './components/ChatScreen';
import BookDemoScreen from './components/BookDemoScreen';
import CallMeScreen from './components/CallMeScreen';
import { trackEvent } from '../../services/analytics';
import { ConfigProvider, useWidgetConfig, ConfigLoader } from './hooks/useWidgetConfig';

interface WidgetProps {
  widgetId: string;
}

/**
 * Widget content component that renders the appropriate screens
 */
interface WidgetContentProps {
  widgetId: string;
}

const WidgetContent: React.FC<WidgetContentProps> = ({ widgetId }) => {
  const { config } = useWidgetConfig();
  
  if (!config) {
    return null; // This should never happen due to ConfigLoader, but TypeScript needs it
  }
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Selected qualification option and team member for the Call Me feature
  const [selectedQualification, setSelectedQualification] = useState<string | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);

  // Handle launcher button click
  const handleLauncherClick = () => {
    setIsOpen(!isOpen);
    trackEvent('widget_toggle', { 
      widgetId, 
      isOpen: !isOpen 
    });
  };

  // Handle navigation back to home screen
  const handleBack = () => {
    setActiveScreen('home');
    // Reset selections when going back to home
    setSelectedQualification(null);
    setSelectedTeamMember(null);
    trackEvent('navigate_home', { widgetId });
  };

  // Handle navigation to a specific screen
  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
    trackEvent('navigate', { 
      widgetId, 
      screen 
    });
  };

  // Handle qualification selection
  const handleQualificationSelect = (qualificationId: string) => {
    setSelectedQualification(qualificationId);
    trackEvent('qualification_selected', { 
      widgetId, 
      qualificationId 
    });
  };

  // Handle team member selection
  const handleTeamMemberSelect = (memberId: string) => {
    setSelectedTeamMember(memberId);
    trackEvent('team_member_selected', { 
      widgetId, 
      memberId 
    });
  };

  // Handle call request
  const handleCallRequest = (phoneNumber: string) => {
    trackEvent('call_requested', { 
      widgetId, 
      qualification: selectedQualification,
      teamMember: selectedTeamMember,
      phoneNumber: phoneNumber.substring(0, 3) + '****' // Mask phone number for tracking
    });
    
    // Here you would typically make an API call to request the call
    // For now, we'll just simulate success
    return Promise.resolve(true);
  };

  // Determine if we should use gradient or solid color
  // Default to false for the new design
  const useGradient = config.design.launcher?.useGradient !== undefined 
    ? config.design.launcher.useGradient 
    : false;

  return (
    <WidgetContainer design={config.design}>
      <LauncherButton 
        onClick={handleLauncherClick} 
        isOpen={isOpen} 
        design={config.design}
      />
      
      {isOpen && (
        <>
          {activeScreen === 'home' && (
            <HomeScreen
              config={config}
              onNavigate={handleNavigate}
            />
          )}
          
          {activeScreen === 'chat' && (
            <ChatScreen 
              config={config}
              onBack={handleBack} 
            />
          )}
          
          {activeScreen === 'book-demo' && (
            <BookDemoScreen 
              config={config}
              onBack={handleBack} 
            />
          )}
          
          {activeScreen === 'call-me' && (
            <CallMeScreen 
              config={config}
              onBack={handleBack}
              selectedQualification={selectedQualification}
              selectedTeamMember={selectedTeamMember}
              onQualificationSelect={handleQualificationSelect}
              onTeamMemberSelect={handleTeamMemberSelect}
              onCallRequest={handleCallRequest}
            />
          )}
        </>
      )}
    </WidgetContainer>
  );
};

/**
 * Main Widget component that loads configuration and renders the appropriate screens
 */
const Widget: React.FC<WidgetProps> = ({ widgetId }) => {
  return (
    <ConfigProvider widgetId={widgetId}>
      <ConfigLoader
        fallback={null} // Don't render anything while loading
        errorFallback={(error) => {
          console.error('Widget configuration error:', error);
          return null; // Don't render the widget if there's an error
        }}
      >
        {(config) => <WidgetContent widgetId={widgetId} />}
      </ConfigLoader>
    </ConfigProvider>
  );
};

export default Widget;
