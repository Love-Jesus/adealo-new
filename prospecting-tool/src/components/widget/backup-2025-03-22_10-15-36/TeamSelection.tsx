import React from 'react';
import { 
  ContentSection, 
  TeamGrid, 
  TeamMemberCard, 
  Avatar, 
  TeamMemberName, 
  TeamMemberRole,
  SlideUp,
  Button
} from '../../styles/styled-components';
import { WidgetDesignConfig, TeamMember, QualificationOption } from '../../../../types/widget/config.types';

interface TeamSelectionProps {
  design: WidgetDesignConfig;
  teamMembers: TeamMember[];
  displayMode: 'grid' | 'carousel';
  onSelect: (memberId: string) => void;
  selectedQualification: QualificationOption | null;
}

/**
 * TeamSelection component that displays the team members to choose from
 */
const TeamSelection: React.FC<TeamSelectionProps> = ({ 
  design, 
  teamMembers, 
  displayMode, 
  onSelect,
  selectedQualification
}) => {
  // Handle selecting any available team member
  const handleSelectAny = () => {
    // Find the first available team member or just the first one
    const firstMember = teamMembers[0];
    if (firstMember) {
      onSelect(firstMember.id);
    }
  };
  
  // Check if a team member is available now
  const isAvailableNow = (member: TeamMember): boolean => {
    if (!member.availability) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = member.availability.start.split(':').map(Number);
    const [endHour, endMinute] = member.availability.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    return currentTime >= startTime && currentTime <= endTime;
  };
  
  return (
    <ContentSection>
      {selectedQualification && (
        <SlideUp delay={0.1}>
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '8px', 
            marginBottom: '16px' 
          }}>
            <strong>Selected:</strong> {selectedQualification.label}
          </div>
        </SlideUp>
      )}
      
      <TeamGrid>
        {teamMembers.map((member, index) => (
          <SlideUp key={member.id} delay={0.1 * (index + 1)}>
            <TeamMemberCard 
              design={design} 
              onClick={() => onSelect(member.id)}
            >
              <Avatar design={design} size="large">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} />
                ) : (
                  <span style={{ fontSize: '24px' }}>
                    {member.name.charAt(0)}
                  </span>
                )}
              </Avatar>
              <TeamMemberName design={design}>{member.name}</TeamMemberName>
              <TeamMemberRole>{member.role}</TeamMemberRole>
              
              {member.availability && (
                <div style={{ 
                  fontSize: '12px', 
                  color: isAvailableNow(member) ? '#4caf50' : '#f44336',
                  marginTop: '4px'
                }}>
                  {isAvailableNow(member) ? 'Available now' : 'Unavailable'}
                </div>
              )}
            </TeamMemberCard>
          </SlideUp>
        ))}
      </TeamGrid>
      
      <SlideUp delay={0.3 + (0.1 * teamMembers.length)}>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button 
            design={design} 
            onClick={handleSelectAny}
            style={{ 
              maxWidth: '280px', 
              margin: '0 auto',
              backgroundColor: 'transparent',
              color: design.colors.primary,
              border: `1px solid ${design.colors.primary}`
            }}
          >
            Or request next available agent
          </Button>
        </div>
      </SlideUp>
    </ContentSection>
  );
};

export default TeamSelection;
