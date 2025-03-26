import React from 'react';
import { 
  ContentSection, 
  QualificationOptionCard, 
  QualificationOptionTitle, 
  QualificationOptionDescription,
  SlideUp
} from '../../styles/styled-components';
import { WidgetDesignConfig, QualificationOption } from '../../../../types/widget/config.types';

interface QualificationStepProps {
  design: WidgetDesignConfig;
  qualificationOptions: QualificationOption[];
  onSelect: (qualificationId: string) => void;
  promptText: string;
}

/**
 * QualificationStep component that displays the qualification options
 */
const QualificationStep: React.FC<QualificationStepProps> = ({ 
  design, 
  qualificationOptions, 
  onSelect,
  promptText
}) => {
  return (
    <ContentSection>
      {qualificationOptions.map((option, index) => (
        <SlideUp key={option.id} delay={0.1 * (index + 1)}>
          <QualificationOptionCard 
            design={design} 
            onClick={() => onSelect(option.id)}
          >
            <QualificationOptionTitle design={design}>
              {option.icon && (
                <span style={{ marginRight: '8px' }}>{option.icon}</span>
              )}
              {option.label}
            </QualificationOptionTitle>
            
            {option.description && (
              <QualificationOptionDescription>
                {option.description}
              </QualificationOptionDescription>
            )}
          </QualificationOptionCard>
        </SlideUp>
      ))}
    </ContentSection>
  );
};

export default QualificationStep;
