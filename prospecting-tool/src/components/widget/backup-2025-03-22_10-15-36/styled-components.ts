import styled, { css, keyframes } from 'styled-components';
import { WidgetDesignConfig } from '../../../types/widget/config.types';

// Animation keyframes
export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const slideIn = keyframes`
  from { transform: translateX(10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Theme interface
interface ThemeProps {
  design: WidgetDesignConfig;
}

// Helper function to get theme values
const getThemeValue = (props: ThemeProps, path: string, defaultValue: string): string => {
  const parts = path.split('.');
  let value: any = props.design;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return defaultValue;
    }
  }
  
  return value || defaultValue;
};

// Container
export const WidgetContainer = styled.div<ThemeProps>`
  position: fixed;
  ${props => props.design.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
  bottom: 20px;
  z-index: 2147483000;
  font-family: ${props => props.design.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'};
`;

// Launcher Button
export const LauncherButton = styled.div<ThemeProps & { useGradient?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.useGradient 
    ? `linear-gradient(135deg, 
        ${getThemeValue(props, 'colors.primary', '#6e8efb')}, 
        ${getThemeValue(props, 'colors.secondary', '#4a6cf7')}
      )`
    : getThemeValue(props, 'colors.primary', '#6e8efb')
  };
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2147483001;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &.pulse {
    animation: ${pulse} 2s infinite;
  }
`;

export const LauncherIcon = styled.svg`
  width: 28px;
  height: 28px;
  color: white;
`;

// Messenger Container
export const MessengerContainer = styled.div<ThemeProps & { isActive: boolean }>`
  position: absolute;
  bottom: 80px;
  ${(props: ThemeProps) => props.design.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
  width: 380px;
  height: 600px;
  max-height: 80vh;
  background-color: transparent;
  border-radius: ${(props: ThemeProps) => props.design.borderRadius || 16}px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  opacity: ${(props: ThemeProps & { isActive: boolean }) => props.isActive ? 1 : 0};
  transform: ${(props: ThemeProps & { isActive: boolean }) => props.isActive 
    ? 'translateY(0) scale(1)' 
    : 'translateY(20px) scale(0.97)'
  };
  transform-origin: ${(props: ThemeProps) => props.design.position === 'bottom-right' 
    ? 'bottom right' 
    : 'bottom left'
  };
  pointer-events: ${props => props.isActive ? 'all' : 'none'};
  visibility: ${props => props.isActive ? 'visible' : 'hidden'};
  transition: transform 0.25s ease, opacity 0.25s ease, visibility 0.25s;
`;

// Screen Container (base for all screens)
export const ScreenContainer = styled.div<ThemeProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
  border-radius: ${props => props.design.borderRadius || 16}px;
  overflow: hidden;
`;

// Header Section
export const HeaderSection = styled.div<ThemeProps & { useGradient?: boolean }>`
  background: ${props => props.useGradient 
    ? `linear-gradient(135deg, 
        ${getThemeValue(props, 'colors.primary', '#6e8efb')}, 
        ${getThemeValue(props, 'colors.secondary', '#4a6cf7')}
      )`
    : getThemeValue(props, 'colors.primary', '#6e8efb')
  };
  color: white;
  padding: 28px 24px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

export const Greeting = styled.h2`
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
`;

export const Tagline = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
  line-height: 1.2;
`;

// Promotional Section
export const PromotionalSection = styled.div<ThemeProps & { isVisible: boolean }>`
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
  border-bottom: 1px solid #f0f0f0;
  padding: ${props => props.isVisible ? '16px' : '0'};
  max-height: ${props => props.isVisible ? '200px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

export const PromotionalCard = styled.a<ThemeProps>`
  display: block;
  text-decoration: none;
  background-color: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

export const PromotionalImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

export const PromotionalContent = styled.div`
  padding: 12px;
`;

export const PromotionalTitle = styled.h3<ThemeProps>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
  margin-bottom: 4px;
`;

export const PromotionalDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

// Content Section
export const ContentSection = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

export const ActionCard = styled.div<ThemeProps>`
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
  border-radius: 100px;
  padding: 16px 20px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

export const ActionTitle = styled.div<ThemeProps>`
  font-size: 16px;
  font-weight: 500;
  color: ${props => getThemeValue(props, 'colors.text', '#333333')};
`;

export const ActionIcon = styled.div<ThemeProps>`
  width: 24px;
  height: 24px;
  color: ${props => getThemeValue(props, 'colors.primary', '#6e8efb')};
`;

export const QuickResponseOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

export const QuickResponseButton = styled.button<ThemeProps>`
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
  color: ${props => getThemeValue(props, 'colors.text', '#333333')};
  border: 1px solid #e0e0e0;
  border-radius: 100px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => getThemeValue(props, 'colors.primary', '#6e8efb')};
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    background-color: #f9f9f9;
  }
`;

// Navigation Section
export const NavSection = styled.div<ThemeProps>`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
`;

export const NavItem = styled.div<ThemeProps & { active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.active ? '#f9f9f9' : 'transparent'};
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

export const NavIcon = styled.svg<ThemeProps>`
  width: 24px;
  height: 24px;
  color: ${props => getThemeValue(props, 'colors.primary', '#6e8efb')};
`;

export const NavText = styled.div<ThemeProps>`
  font-size: 16px;
  font-weight: 500;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
`;

// Header
export const Header = styled.div<ThemeProps>`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BackButton = styled.button<ThemeProps>`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const HeaderTitle = styled.div<ThemeProps>`
  font-weight: 600;
  font-size: 16px;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
`;

export const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: #777;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
`;

export const HeaderButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
`;

// Avatar
export const Avatar = styled.div<ThemeProps & { size?: 'small' | 'medium' | 'large' }>`
  width: ${(props: ThemeProps & { size?: 'small' | 'medium' | 'large' }) => {
    switch (props.size) {
      case 'small': return '28px';
      case 'large': return '64px';
      default: return '48px';
    }
  }};
  height: ${(props: ThemeProps & { size?: 'small' | 'medium' | 'large' }) => {
    switch (props.size) {
      case 'small': return '28px';
      case 'large': return '64px';
      default: return '48px';
    }
  }};
  border-radius: ${props => props.size === 'small' ? '6px' : '12px'};
  background-color: ${props => getThemeValue(props, 'colors.primary', '#6e8efb')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Team Grid
export const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

export const TeamMemberCard = styled.div<ThemeProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

export const TeamMemberName = styled.div<ThemeProps>`
  font-weight: 600;
  font-size: 16px;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
`;

export const TeamMemberRole = styled.div`
  font-size: 14px;
  color: #777;
`;

// Qualification Options
export const QualificationOptionCard = styled.div<ThemeProps>`
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-color: ${props => getThemeValue(props, 'colors.primary', '#6e8efb')};
  }
`;

export const QualificationOptionTitle = styled.div<ThemeProps>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const QualificationOptionDescription = styled.div`
  font-size: 14px;
  color: #777;
`;

// Input Elements
export const PhoneInput = styled.input<ThemeProps>`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
  outline: none;
  
  &:focus {
    border-color: ${props => getThemeValue(props, 'colors.primary', '#6e8efb')};
  }
`;

export const Button = styled.button<ThemeProps>`
  background-color: ${(props: ThemeProps) => getThemeValue(props, 'colors.primary', '#6e8efb')};
  color: white;
  border: none;
  border-radius: 100px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
    background-color: ${(props: ThemeProps) => {
      const color = getThemeValue(props, 'colors.primary', '#6e8efb');
      // Darken the color by 10%
      return color.replace(/^#/, '').match(/.{2}/g)?.map(
        (x: string) => Math.max(0, parseInt(x, 16) - 25).toString(16).padStart(2, '0')
      ).join('') || '#333';
    }};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

// Chat Elements
export const ChatMessages = styled.div<ThemeProps>`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f9f9fa;
`;

export const AdminInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const AdminName = styled.div<ThemeProps>`
  font-weight: 500;
  font-size: 14px;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
`;

export const MessageBubble = styled.div<ThemeProps & { isAdmin?: boolean }>`
  max-width: 70%;
  padding: 14px 16px;
  border-radius: 18px;
  margin-bottom: 16px;
  position: relative;
  
  ${(props: ThemeProps & { isAdmin?: boolean }) => props.isAdmin ? css`
    background-color: #f0f0f0;
    border-bottom-left-radius: 4px;
    align-self: flex-start;
    margin-right: auto;
  ` : css`
    background-color: ${getThemeValue(props, 'colors.primary', '#6e8efb')};
    color: white;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
    margin-left: auto;
  `}
`;

export const MessageTimestamp = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
`;

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: #f0f0f0;
  width: fit-content;
  margin-bottom: 16px;
  
  span {
    width: 8px;
    height: 8px;
    background-color: #999;
    border-radius: 50%;
    animation: ${pulse} 1s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

export const ChatInputContainer = styled.div<ThemeProps>`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
`;

export const ChatInput = styled.textarea<ThemeProps>`
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 12px 16px;
  font-size: 15px;
  resize: none;
  outline: none;
  min-height: 54px;
  max-height: 150px;
  
  &:focus {
    border-color: ${props => getThemeValue(props, 'colors.primary', '#6e8efb')};
  }
`;

// Book Demo Elements
export const DemoContent = styled.div<ThemeProps>`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
`;

export const DemoTitle = styled.h2<ThemeProps>`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
`;

export const DemoDescription = styled.p<ThemeProps>`
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
`;

export const CalendlyIframe = styled.iframe`
  width: 100%;
  height: 500px;
  border: none;
  border-radius: 8px;
  overflow: hidden;
`;

// Call Me Elements
export const CallContent = styled.div<ThemeProps>`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => getThemeValue(props, 'colors.background', '#fff')};
`;

export const CallTitle = styled.h2<ThemeProps>`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
  color: ${props => getThemeValue(props, 'colors.text', '#333')};
`;

export const CallDescription = styled.p<ThemeProps>`
  color: #666;
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.5;
`;

export const CallTimer = styled.div<ThemeProps>`
  margin-top: 24px;
  font-size: 18px;
  color: #888;
`;

export const SelectedOption = styled.div<ThemeProps>`
  padding: 8px 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
`;

// Animation wrappers
export const FadeIn = styled.div<{ delay?: number }>`
  animation: ${fadeIn} 0.3s ease-in-out ${props => props.delay || 0}s both;
`;

export const SlideUp = styled.div<{ delay?: number }>`
  animation: ${slideUp} 0.3s ease-in-out ${props => props.delay || 0}s both;
`;

export const SlideIn = styled.div<{ delay?: number }>`
  animation: ${slideIn} 0.3s ease-in-out ${props => props.delay || 0}s both;
`;
