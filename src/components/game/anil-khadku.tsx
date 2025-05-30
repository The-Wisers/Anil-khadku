
"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import type { StickmanState } from '@/lib/types';
import { useState, useEffect } from 'react';

interface AnilKhadkuProps extends SVGProps<SVGSVGElement> {
  state: StickmanState;
  // x and y from state are now center, so we adjust translation
  // width and height are needed for centering calculation
  width?: number;
  height?: number;
}

export function AnilKhadku({ state, className, width = 48, height = 72, ...props }: AnilKhadkuProps) {
  const [limbRotations, setLimbRotations] = useState({
    leftArm: 0,
    rightArm: 0,
    leftLeg: 0,
    rightLeg: 0,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.isHit) {
      setLimbRotations({
        leftArm: -45 + (Math.random() - 0.5) * 40,
        rightArm: -45 + (Math.random() - 0.5) * 40,
        leftLeg: 30 + (Math.random() - 0.5) * 40,
        rightLeg: 30 + (Math.random() - 0.5) * 40,
      });

      timer = setTimeout(() => {
        setLimbRotations({ leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0 });
      }, 500); 
    }
    return () => clearTimeout(timer);
  }, [state.isHit]);
  
  // Calculate top-left for SVG positioning based on center x, y
  const svgX = state.x - width / 2;
  const svgY = state.y - height / 2;

  return (
    <svg
      viewBox="-50 -10 100 120"
      className={cn(
        "w-48 h-72 cursor-grab transition-transform duration-0 ease-out", // Removed duration-75 for smoother physics
        state.isBeingDragged && "cursor-grabbing scale-105",
        state.isHit && "animate-shake",
        className
      )}
      style={{
        // Position is now absolute within the GameArea based on physics
        position: 'absolute',
        left: `${svgX}px`,
        top: `${svgY}px`,
        transform: `rotate(${state.rotation}deg)`,
        transformOrigin: 'center center', 
      }}
      {...props}
    >
      <g stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round">
        {/* Head */}
        <circle cx="0" cy="10" r="10" fill="hsl(var(--foreground))" />
        
        {/* Body */}
        <line x1="0" y1="20" x2="0" y2="60" fill="hsl(var(--foreground))" />

        {/* Arms - Attached at (0,30) */}
        <line 
          x1="0" y1="0" x2="-25" y2="15" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 30) rotate(${limbRotations.leftArm})`} 
          fill="hsl(var(--foreground))" 
        />
        <line 
          x1="0" y1="0" x2="25" y2="15" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 30) rotate(${limbRotations.rightArm})`} 
          fill="hsl(var(--foreground))" 
        />

        {/* Legs - Attached at (0,60) */}
        <line 
          x1="0" y1="0" x2="-20" y2="30" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 60) rotate(${limbRotations.leftLeg})`} 
          fill="hsl(var(--foreground))" 
        />
        <line 
          x1="0" y1="0" x2="20" y2="30" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 60) rotate(${limbRotations.rightLeg})`} 
          fill="hsl(var(--foreground))" 
        />
      </g>
      
      {state.isHit && (
        <g stroke="hsl(var(--primary))" fill="none" strokeWidth="1.5">
          <line x1="-4" y1="7" x2="-0" y2="11" /> 
          <line x1="-0" y1="7" x2="-4" y2="11" />
          <line x1="4" y1="7" x2="0" y2="11" />
          <line x1="0" y1="7" x2="4" y2="11" />
          <path d="M -3 14 Q 0 12 3 14" />
        </g>
      )}
      {!state.isHit && (
         <g stroke="hsl(var(--foreground))" fill="none" strokeWidth="1">
            <circle cx="-2.5" cy="8" r="0.5" fill="hsl(var(--foreground))" />
            <circle cx="2.5" cy="8" r="0.5" fill="hsl(var(--foreground))" />
            <path d="M -2 13 Q 0 14 2 13" />
        </g>
      )}
    </svg>
  );
}
