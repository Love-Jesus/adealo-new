import React from "react";
import { cn } from "@/lib/utils";

interface AdealoLogoProps {
  className?: string;
}

export function AdealoLogo({ className }: AdealoLogoProps) {
  return (
    <div className={cn("flex items-center group-data-[collapsible=icon]:hidden", className)}>
      <div className="relative">
        {/* Logo text with Inter font */}
        <h1 
          className="text-sm font-bold tracking-tight text-foreground"
          style={{ 
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.02em",
            textShadow: "0 0 1px rgba(255,255,255,0.1)"
          }}
        >
          Adealo
        </h1>
        
        {/* Subtle RGB glow effect only on edges */}
        <div 
          className="absolute -inset-[1px] rounded-md opacity-30 blur-[1px] animate-gradient pointer-events-none"
          style={{ 
            background: "linear-gradient(45deg, #ff0000, #00ff00, #0000ff)",
            zIndex: -1,
            filter: "brightness(1.2) contrast(1.5)"
          }}
        >
          <span 
            className="text-sm font-bold tracking-tight invisible"
            style={{ 
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.02em"
            }}
          >
            Adealo
          </span>
        </div>
      </div>
    </div>
  );
}
