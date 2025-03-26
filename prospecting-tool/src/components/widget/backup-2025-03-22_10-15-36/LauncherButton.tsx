import React from 'react';
import { LauncherButton as StyledLauncherButton, LauncherIcon } from '../styles/styled-components';
import { WidgetDesignConfig } from '../../../types/widget/config.types';

interface LauncherButtonProps {
  onClick: () => void;
  isOpen: boolean;
  design: WidgetDesignConfig;
}

/**
 * LauncherButton component that displays the launcher button for the widget
 */
const LauncherButton: React.FC<LauncherButtonProps> = ({ onClick, isOpen, design }) => {
  // Determine if we should use gradient or solid color
  // Default to true for backward compatibility
  const useGradient = design.launcher?.useGradient !== false;
  
  return (
    <StyledLauncherButton 
      onClick={onClick} 
      design={design}
      useGradient={useGradient}
      className={design.launcher?.pulseAnimation ? 'pulse' : ''}
    >
      <LauncherIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isOpen ? (
          // X icon when open
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
        ) : (
          // Chat icon when closed
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor" />
        )}
      </LauncherIcon>
    </StyledLauncherButton>
  );
};

export default LauncherButton;
