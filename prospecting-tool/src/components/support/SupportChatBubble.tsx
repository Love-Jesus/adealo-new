import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

interface SupportChatBubbleProps {
  onClick: () => void;
  visible?: boolean;
}

export function SupportChatBubble({ onClick, visible = true }: SupportChatBubbleProps) {
  const [animate, setAnimate] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Start animation when the bubble becomes visible
  useEffect(() => {
    if (visible) {
      // Small delay before starting animation for better UX
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
        animate ? "scale-100" : "scale-0"
      }`}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none overflow-hidden"
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Contained RGB Border Animation */}
        <div className="absolute inset-1 rounded-full rgb-border opacity-60"></div>
        
        {/* Icon */}
        <MessageSquare 
          className="w-8 h-8 z-10 transition-transform duration-200" 
          style={{
            transform: isHovered ? 'scale(0.9)' : 'scale(1)',
          }}
        />
      </button>
    </div>
  );
}
