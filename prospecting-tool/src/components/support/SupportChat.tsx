import { useState, useEffect } from "react";
import { SupportChatBubble } from "./SupportChatBubble";
import { SupportChatDialog } from "./SupportChatDialog";

interface SupportChatProps {
  adminAvailable?: boolean;
}

export function SupportChat({ 
  adminAvailable = false
}: SupportChatProps) {
  const [showDialog, setShowDialog] = useState(false);

  // Handle bubble click
  const handleBubbleClick = () => {
    setShowDialog(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowDialog(false);
  };

  // Listen for support trigger clicks
  useEffect(() => {
    const handleSupportTriggerClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const supportTrigger = target.closest('[data-support-trigger="true"]');
      
      if (supportTrigger) {
        event.preventDefault();
        setShowDialog(true);
      }
    };

    document.addEventListener('click', handleSupportTriggerClick);
    
    return () => {
      document.removeEventListener('click', handleSupportTriggerClick);
    };
  }, []);

  return (
    <>
      <SupportChatBubble 
        visible={!showDialog} 
        onClick={handleBubbleClick} 
      />
      <SupportChatDialog 
        visible={showDialog} 
        onClose={handleDialogClose} 
        adminAvailable={adminAvailable} 
      />
    </>
  );
}
