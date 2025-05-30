
"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import type { StickmanState } from '@/lib/types';
import { useState, useEffect } from 'react';

interface AnilKhadkuProps extends SVGProps<SVGSVGElement> {
  state: StickmanState;
}

export function AnilKhadku({ state, className, ...props }: AnilKhadkuProps) {
  const [limbRotations, setLimbRotations] = useState({
    leftArm: 0,
    rightArm: 0,
    leftLeg: 0,
    rightLeg: 0,
  });

  useEffect(() => {
    if (state.isHit) {
      setLimbRotations({
        leftArm: -45 + (Math.random() - 0.5) * 40, // Swing back & up
        rightArm: -45 + (Math.random() - 0.5) * 40, // Swing back & up
        leftLeg: 30 + (Math.random() - 0.5) * 40,  // Swing forward & up
        rightLeg: 30 + (Math.random() - 0.5) * 40,  // Swing forward & up
      });

      const timer = setTimeout(() => {
        setLimbRotations({ leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0 });
      }, 500); // Duration of flail, matches shake animation

      return () => clearTimeout(timer);
    }
  }, [state.isHit]);

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
        transformOrigin: 'center center', // Ensures rotation is around the body's center
      }}
      {...props}
    >
      <g stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round">
        {/* Head */}
        <circle cx="0" cy="10" r="10" fill="hsl(var(--foreground))" />
        
        {/* Body */}
        <line x1="0" y1="20" x2="0" y2="60" fill="hsl(var(--foreground))" />

        {/* Arms - Attached at (0,30) */}
        {/* Left Arm: original (0,30) to (-25,45) => drawn from (0,0) to (-25,15) then translated and rotated */}
        <line 
          x1="0" y1="0" x2="-25" y2="15" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 30) rotate(${limbRotations.leftArm})`} 
          fill="hsl(var(--foreground))" 
        />
        {/* Right Arm: original (0,30) to (25,45) => drawn from (0,0) to (25,15) then translated and rotated */}
        <line 
          x1="0" y1="0" x2="25" y2="15" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 30) rotate(${limbRotations.rightArm})`} 
          fill="hsl(var(--foreground))" 
        />

        {/* Legs - Attached at (0,60) */}
        {/* Left Leg: original (0,60) to (-20,90) => drawn from (0,0) to (-20,30) then translated and rotated */}
        <line 
          x1="0" y1="0" x2="-20" y2="30" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 60) rotate(${limbRotations.leftLeg})`} 
          fill="hsl(var(--foreground))" 
        />
        {/* Right Leg: original (0,60) to (20,90) => drawn from (0,0) to (20,30) then translated and rotated */}
        <line 
          x1="0" y1="0" x2="20" y2="30" 
          style={{ transformOrigin: '0px 0px' }}
          transform={`translate(0, 60) rotate(${limbRotations.rightLeg})`} 
          fill="hsl(var(--foreground))" 
        />
      </g>
      
      {/* Facial expression change on hit */}
      {state.isHit && (
        <g stroke="hsl(var(--primary))" fill="none" strokeWidth="1.5">
          {/* X'd out eyes */}
          <line x1="-4" y1="7" x2="-0" y2="11" /> 
          <line x1="-0" y1="7" x2="-4" y2="11" />
          <line x1="4" y1="7" x2="0" y2="11" />
          <line x1="0" y1="7" x2="4" y2="11" />
          {/* Sad/Ouch mouth */}
          <path d="M -3 14 Q 0 12 3 14" />
        </g>
      )}
      {!state.isHit && ( // Default simple face
         <g stroke="hsl(var(--foreground))" fill="none" strokeWidth="1">
            <circle cx="-2.5" cy="8" r="0.5" fill="hsl(var(--foreground))" />
            <circle cx="2.5" cy="8" r="0.5" fill="hsl(var(--foreground))" />
            <path d="M -2 13 Q 0 14 2 13" />
        </g>
      )}
    </svg>
  );
}
