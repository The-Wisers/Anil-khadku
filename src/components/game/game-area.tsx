
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { StickmanState } from '@/lib/types'; // Removed Weapon, SessionStats
import { AnilKhadku } from './anil-khadku';
import { Card, CardContent } from '@/components/ui/card';
// Removed Button and Target imports
import { useToast } from '@/hooks/use-toast';

interface GameAreaProps {
  // Removed selectedWeapon, sessionStats, updateSessionStats props
}

export function GameArea({ }: GameAreaProps) { // Props are now empty
  const [stickmanState, setStickmanState] = useState<StickmanState>({
    x: 0,
    y: 0,
    rotation: 0,
    isBeingDragged: false,
    isHit: false,
  });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; stickmanX: number; stickmanY: number } | null>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX - rect.left, // Make coordinates relative to the game area
      y: e.clientY - rect.top,
      stickmanX: stickmanState.x,
      stickmanY: stickmanState.y,
    };
    setStickmanState(prev => ({ ...prev, isBeingDragged: true }));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!stickmanState.isBeingDragged || !dragStartRef.current || !gameAreaRef.current) {
      return;
    }
    
    const { x: dragRefX, y: dragRefY, stickmanX: dragRefStickmanX, stickmanY: dragRefStickmanY } = dragStartRef.current;
    const rect = gameAreaRef.current.getBoundingClientRect();

    const dx = (e.clientX - rect.left) - dragRefX;
    const dy = (e.clientY - rect.top) - dragRefY;

    setStickmanState(prev => ({
      ...prev,
      x: dragRefStickmanX + dx,
      y: dragRefStickmanY + dy,
    }));
  }, [stickmanState.isBeingDragged]);

  const handleMouseUp = useCallback(() => {
    if (stickmanState.isBeingDragged) {
      setStickmanState(prev => ({ ...prev, isBeingDragged: false }));
    }
    dragStartRef.current = null;
  }, [stickmanState.isBeingDragged]);

  useEffect(() => {
    if (stickmanState.isBeingDragged) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [stickmanState.isBeingDragged, handleMouseMove, handleMouseUp]);

  const handleInteraction = () => {
    // Simplified interaction: just a generic hit
    toast({
      title: "Anil Khadku Whacked!",
      description: "He felt that one!",
    });
    // Removed sessionStats update logic

    setStickmanState(prev => ({ ...prev, isHit: true, rotation: (prev.rotation + (Math.random() > 0.5 ? 15 : -15)) % 360  })); // Add a slight rotation on hit
    setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500); // Duration of shake animation
  };

  return (
    <Card ref={gameAreaRef} className="h-full flex items-center justify-center relative overflow-hidden shadow-xl bg-muted/30 border-2 border-dashed border-accent/50">
      <CardContent className="w-full h-full flex items-center justify-center p-0 relative"> {/* Ensure CardContent is also relative for positioning context */}
        <AnilKhadku
          state={stickmanState}
          onMouseDown={handleMouseDown}
          onClick={handleInteraction} 
          onTouchStart={(e) => { 
             if (e.touches[0] && gameAreaRef.current) {
                const rect = gameAreaRef.current.getBoundingClientRect();
                const pseudoMouseEvent = { 
                    clientX: e.touches[0].clientX, 
                    clientY: e.touches[0].clientY, 
                    preventDefault: () => e.preventDefault() 
                } as unknown as React.MouseEvent<SVGSVGElement>;
                handleMouseDown(pseudoMouseEvent);
             }
          }}
          // Added style to position AnilKhadku absolutely within the CardContent
          // This allows the x, y from stickmanState to work relative to the center of the GameArea
          // The transform in AnilKhadku will then apply from this centered position.
          // However, viewBox in SVG usually handles this, so explicit style might not be needed if SVG is set up for relative internal coords.
          // For now, relying on the transform in AnilKhadku, and ensuring parent (CardContent) is a positioning context.
        />
      </CardContent>
      {/* Removed the "Use Weapon" button */}
       <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground text-sm p-2 bg-background/80 rounded-md">
        Drag or click Anil Khadku!
      </div>
    </Card>
  );
}
