import React, { useState, useEffect } from 'react';
import { 
  ContentSection, 
  CallContent, 
  CallTitle, 
  CallDescription, 
  PhoneInput as StyledPhoneInput, 
  Button, 
  CallTimer, 
  SelectedOption, 
  Avatar,
  FadeIn,
  SlideUp
} from '../../styles/styled-components';
import { WidgetDesignConfig, QualificationOption, TeamMember } from '../../../../types/widget/config.types';

interface PhoneInputProps {
  design: WidgetDesignConfig;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  phoneNumber: string;
  isSubmitting: boolean;
  error: string | null;
  callRequested: boolean;
  responseType: 'fixed' | 'asap';
  responseTime?: number;
  messages: {
    title: string;
    description: string;
    asapMessage: string;
    fixedTimeMessage: string;
  };
  selectedQualification: QualificationOption | null;
  selectedTeamMember: TeamMember | null;
}

/**
 * PhoneInput component that displays the phone input form
 */
const PhoneInput: React.FC<PhoneInputProps> = ({ 
  design, 
  onPhoneChange, 
  onSubmit, 
  phoneNumber, 
  isSubmitting, 
  error, 
  callRequested,
  responseType,
  responseTime,
  messages,
  selectedQualification,
  selectedTeamMember
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(responseTime ? responseTime * 60 : 180);
  
  // Start countdown timer when call is requested
  useEffect(() => {
    if (callRequested && responseType === 'fixed') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [callRequested, responseType]);
  
  // Format time left as MM:SS
  const formatTimeLeft = (): string => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get response message based on response type
  const getResponseMessage = (): string => {
    if (responseType === 'asap') {
      return messages.asapMessage || 'We\'ll call you as soon as possible';
    } else {
      return (messages.fixedTimeMessage || 'We\'ll call you within {time} minutes')
        .replace('{time}', String(responseTime || 3));
    }
  };
  
  return (
    <ContentSection>
      <CallContent design={design}>
        {selectedTeamMember && (
          <FadeIn delay={0.1}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Avatar design={design} size="large">
                {selectedTeamMember.avatar ? (
                  <img src={selectedTeamMember.avatar} alt={selectedTeamMember.name} />
                ) : (
                  <span style={{ fontSize: '24px' }}>
                    {selectedTeamMember.name.charAt(0)}
                  </span>
                )}
              </Avatar>
              <div style={{ marginTop: '8px' }}>
                <strong>{selectedTeamMember.name}</strong> will call you
                {responseType === 'asap' ? ' right away' : ''}
              </div>
            </div>
          </FadeIn>
        )}
        
        {selectedQualification && (
          <SlideUp delay={0.2}>
            <SelectedOption design={design}>
              Selected: {selectedQualification.label}
            </SelectedOption>
          </SlideUp>
        )}
        
        <SlideUp delay={0.3}>
          <CallTitle design={design}>
            {messages.title || 'Get a call from our team'}
          </CallTitle>
        </SlideUp>
        
        <SlideUp delay={0.4}>
          <CallDescription design={design}>
            {callRequested 
              ? getResponseMessage()
              : (messages.description || 'Enter your phone number and we\'ll call you shortly.')}
          </CallDescription>
        </SlideUp>
        
        {!callRequested ? (
          <SlideUp delay={0.5}>
            <StyledPhoneInput
              design={design}
              type="tel"
              placeholder="Your phone number"
              value={phoneNumber}
              onChange={(e) => onPhoneChange(e.target.value)}
              disabled={isSubmitting}
            />
            
            {error && (
              <div style={{ 
                color: '#f44336', 
                fontSize: '14px', 
                marginTop: '-8px', 
                marginBottom: '16px' 
              }}>
                {error}
              </div>
            )}
            
            <Button 
              design={design} 
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Requesting...' : 'Request Call'}
            </Button>
          </SlideUp>
        ) : (
          <SlideUp delay={0.5}>
            {responseType === 'fixed' && (
              <CallTimer design={design}>
                {timeLeft > 0 
                  ? `We'll call you within ${formatTimeLeft()}`
                  : 'We should have called you by now!'}
              </CallTimer>
            )}
          </SlideUp>
        )}
      </CallContent>
    </ContentSection>
  );
};

export default PhoneInput;
