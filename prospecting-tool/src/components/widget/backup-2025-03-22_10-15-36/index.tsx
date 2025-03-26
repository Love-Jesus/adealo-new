import React, { useState } from 'react';
import { 
  ScreenContainer, 
  Header, 
  HeaderLeft, 
  BackButton, 
  HeaderInfo, 
  HeaderTitle, 
  HeaderSubtitle,
  FadeIn
} from '../../styles/styled-components';
import { WidgetConfig } from '../../../../types/widget/config.types';
import { trackInteraction } from '../../../../services/analytics';
import QualificationStep from './QualificationStep';
import TeamSelection from './TeamSelection';
import PhoneInput from './PhoneInput';

interface CallMeScreenProps {
  config: WidgetConfig;
  onBack: () => void;
  selectedQualification: string | null;
  selectedTeamMember: string | null;
  onQualificationSelect: (qualificationId: string) => void;
  onTeamMemberSelect: (memberId: string) => void;
  onCallRequest: (phoneNumber: string) => Promise<boolean>;
}

/**
 * CallMeScreen component that displays the call request flow
 * This is a multi-step process:
 * 1. Qualification selection (if enabled)
 * 2. Team member selection (if team mode is enabled)
 * 3. Phone number input
 */
const CallMeScreen: React.FC<CallMeScreenProps> = ({ 
  config, 
  onBack, 
  selectedQualification, 
  selectedTeamMember, 
  onQualificationSelect, 
  onTeamMemberSelect, 
  onCallRequest 
}) => {
  const { design, features } = config;
  const { callMe } = features;
  
  // Current step in the flow
  const [currentStep, setCurrentStep] = useState<string>(() => {
    // Determine initial step based on configuration and selections
    if (callMe.qualificationEnabled && !selectedQualification) {
      return 'qualification';
    } else if (callMe.mode === 'team' && !selectedTeamMember) {
      return 'team';
    } else {
      return 'phone';
    }
  });
  
  // Phone number state
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [callRequested, setCallRequested] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle qualification selection
  const handleQualificationSelect = (qualificationId: string) => {
    onQualificationSelect(qualificationId);
    
    // Move to next step
    if (callMe.mode === 'team') {
      setCurrentStep('team');
    } else {
      setCurrentStep('phone');
    }
    
    trackInteraction('qualification_selected', { qualificationId });
  };
  
  // Handle team member selection
  const handleTeamMemberSelect = (memberId: string) => {
    onTeamMemberSelect(memberId);
    setCurrentStep('phone');
    trackInteraction('team_member_selected', { memberId });
  };
  
  // Handle phone number change
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (error) setError(null);
  };
  
  // Handle call request submission
  const handleCallRequest = async () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 6) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onCallRequest(phoneNumber);
      
      if (success) {
        setCallRequested(true);
        trackInteraction('call_requested', { 
          qualification: selectedQualification,
          teamMember: selectedTeamMember
        });
      } else {
        setError('Failed to request call. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error requesting call:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get the selected qualification option
  const getSelectedQualification = () => {
    if (!selectedQualification) return null;
    
    return callMe.qualificationOptions.find(option => option.id === selectedQualification);
  };
  
  // Get the selected team member
  const getSelectedTeamMember = () => {
    if (!selectedTeamMember) return null;
    
    return callMe.team.members.find(member => member.id === selectedTeamMember);
  };
  
  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 'qualification':
        return (
          <QualificationStep 
            design={design}
            qualificationOptions={callMe.qualificationOptions}
            onSelect={handleQualificationSelect}
            promptText={callMe.messages.qualificationPrompt}
          />
        );
      case 'team':
        return (
          <TeamSelection 
            design={design}
            teamMembers={callMe.team.members}
            displayMode={callMe.team.displayMode}
            onSelect={handleTeamMemberSelect}
            selectedQualification={getSelectedQualification()}
          />
        );
      case 'phone':
        return (
          <PhoneInput 
            design={design}
            onPhoneChange={handlePhoneChange}
            onSubmit={handleCallRequest}
            phoneNumber={phoneNumber}
            isSubmitting={isSubmitting}
            error={error}
            callRequested={callRequested}
            responseType={callMe.responseType}
            responseTime={callMe.responseTime}
            messages={callMe.messages}
            selectedQualification={getSelectedQualification()}
            selectedTeamMember={getSelectedTeamMember()}
          />
        );
      default:
        return null;
    }
  };
  
  // Get the header title based on the current step
  const getHeaderTitle = () => {
    switch (currentStep) {
      case 'qualification':
        return 'How can we help you?';
      case 'team':
        return 'Choose who to talk to';
      case 'phone':
        return callMe.messages.title || 'Request a call';
      default:
        return 'Call Me';
    }
  };
  
  // Get the header subtitle based on the current step
  const getHeaderSubtitle = () => {
    switch (currentStep) {
      case 'qualification':
        return 'Select an option below';
      case 'team':
        return 'Our team is ready to help';
      case 'phone':
        return callRequested 
          ? 'We\'ll call you shortly' 
          : 'Enter your phone number';
      default:
        return '';
    }
  };
  
  // Handle back button click
  const handleBackClick = () => {
    if (currentStep === 'phone' && callMe.mode === 'team' && !callRequested) {
      setCurrentStep('team');
    } else if (currentStep === 'phone' && callMe.qualificationEnabled && !callRequested) {
      setCurrentStep('qualification');
    } else if (currentStep === 'team' && callMe.qualificationEnabled) {
      setCurrentStep('qualification');
    } else {
      onBack();
    }
  };
  
  return (
    <ScreenContainer design={design}>
      <Header design={design}>
        <HeaderLeft>
          <BackButton design={design} onClick={handleBackClick}>←</BackButton>
          <HeaderInfo>
            <FadeIn key={currentStep}>
              <HeaderTitle design={design}>{getHeaderTitle()}</HeaderTitle>
              <HeaderSubtitle>{getHeaderSubtitle()}</HeaderSubtitle>
            </FadeIn>
          </HeaderInfo>
        </HeaderLeft>
      </Header>
      
      {renderStep()}
    </ScreenContainer>
  );
};

export default CallMeScreen;
