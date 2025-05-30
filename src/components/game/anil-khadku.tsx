
"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import type { StickmanState } from '@/lib/types';

interface AnilKhadkuProps extends SVGProps<SVGSVGElement> {
  state: StickmanState;
}

export function AnilKhadku({ state, className, ...props }: AnilKhadkuProps) {
  return (
    <svg
      viewBox="-50 -10 100 120" // Adjusted viewBox for better centering and space
      className={cn(
        "w-48 h-72 cursor-grab transition-transform duration-75 ease-out",
        state.isBeingDragged && "cursor-grabbing scale-105",
        state.isHit && "animate-shake",
        className
      )}
      style={{
        transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg)`,
      }}
      {...props}
    >
      {/* Stickman parts: made solid dark gray for visibility */}
      <g fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round">
        {/* Head - will inherit fill and stroke from parent g */}
        <circle cx="0" cy="10" r="10" />
        {/* Body */}
        <line x1="0" y1="20" x2="0" y2="60" />
        {/* Arms */}
        <line x1="0" y1="30" x2="-25" y2="45" />
        <line x1="0" y1="30" x2="25" y2="45" />
        {/* Legs */}
        <line x1="0" y1="60" x2="-20" y2="90" />
        <line x1="0" y1="60" x2="20" y2="90" />
      </g>
      {/* Facial expression change on hit */}
      {state.isHit && (
        <g stroke="hsl(var(--primary))" fill="none" strokeWidth="1.5">
          <line x1="-3" y1="7" x2="-1" y2="9" />
          <line x1="-1" y1="7" x2="-3" y2="9" />
          <line x1="3" y1="7" x2="1" y2="9" />
          <line x1="1" y1="7" x2="3" y2="9" />
          <path d="M -3 13 Q 0 11 3 13" />
        </g>
      )}
    </svg>
  );
}
