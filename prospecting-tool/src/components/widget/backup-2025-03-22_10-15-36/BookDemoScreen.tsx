import React from 'react';
import { 
  ScreenContainer, 
  Header, 
  HeaderLeft, 
  BackButton, 
  HeaderInfo, 
  HeaderTitle, 
  HeaderSubtitle, 
  DemoContent, 
  DemoTitle, 
  DemoDescription, 
  CalendlyIframe,
  FadeIn,
  SlideUp
} from '../styles/styled-components';
import { WidgetConfig } from '../../../types/widget/config.types';
import { trackInteraction } from '../../../services/analytics';

interface BookDemoScreenProps {
  config: WidgetConfig;
  onBack: () => void;
}

/**
 * BookDemoScreen component that displays the Calendly booking interface
 */
const BookDemoScreen: React.FC<BookDemoScreenProps> = ({ config, onBack }) => {
  const { design, features } = config;
  const { bookDemo } = features;
  
  // Track when the Calendly iframe loads
  const handleCalendlyLoad = () => {
    trackInteraction('calendly_loaded', {});
  };
  
  // Track when a booking is made (this would need to be integrated with Calendly's API)
  const handleBookingMade = () => {
    trackInteraction('booking_made', {});
  };
  
  return (
    <ScreenContainer design={design}>
      <Header design={design}>
        <HeaderLeft>
          <BackButton design={design} onClick={onBack}>←</BackButton>
          <HeaderInfo>
            <HeaderTitle design={design}>Book a Demo</HeaderTitle>
            <HeaderSubtitle>Schedule a time with our team</HeaderSubtitle>
          </HeaderInfo>
        </HeaderLeft>
      </Header>
      
      <DemoContent design={design}>
        <FadeIn delay={0.1}>
          <DemoTitle design={design}>{bookDemo.title || 'Choose a time for your demo'}</DemoTitle>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <DemoDescription design={design}>
            {bookDemo.description || 'Pick a date and time that works best for you. Our team will walk you through our product and answer any questions you have.'}
          </DemoDescription>
        </FadeIn>
        
        <SlideUp delay={0.3}>
          <CalendlyIframe
            src={bookDemo.calendlyUrl || 'https://calendly.com/your-company/30min'}
            onLoad={handleCalendlyLoad}
            title="Book a Demo"
          />
        </SlideUp>
      </DemoContent>
    </ScreenContainer>
  );
};

export default BookDemoScreen;
