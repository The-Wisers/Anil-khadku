
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { StickmanState } from '@/lib/types';
import { AnilKhadku } from './anil-khadku';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface GameAreaProps {}

export function GameArea({ }: GameAreaProps) {
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
    const clientX = (e.nativeEvent as MouseEvent).clientX ?? (e.nativeEvent as TouchEvent).touches?.[0]?.clientX ?? 0;
    const clientY = (e.nativeEvent as MouseEvent).clientY ?? (e.nativeEvent as TouchEvent).touches?.[0]?.clientY ?? 0;
    
    dragStartRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      stickmanX: stickmanState.x,
      stickmanY: stickmanState.y,
    };
    setStickmanState(prev => ({ ...prev, isBeingDragged: true, isHit: false })); // Stop hit animation on drag
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!stickmanState.isBeingDragged || !gameAreaRef.current) {
      return;
    }
    // Capture values from dragStartRef.current *before* setStickmanState
    const currentDragStart = dragStartRef.current;
    if (!currentDragStart) return; // Should not happen if isBeingDragged is true

    const { x: dragRefX, y: dragRefY, stickmanX: dragRefStickmanX, stickmanY: dragRefStickmanY } = currentDragStart;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? 0;
    const clientY = (e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY ?? 0;

    const dx = (clientX - rect.left) - dragRefX;
    const dy = (clientY - rect.top) - dragRefY;

    setStickmanState(prev => ({
      ...prev,
      x: dragRefStickmanX + dx,
      y: dragRefStickmanY + dy,
    }));
  }, [stickmanState.isBeingDragged]); // Dependency on dragStartRef.current is implicit through isBeingDragged

  const handleMouseUp = useCallback(() => {
    if (stickmanState.isBeingDragged) {
      setStickmanState(prev => ({ ...prev, isBeingDragged: false }));
    }
    dragStartRef.current = null;
  }, [stickmanState.isBeingDragged]);

  useEffect(() => {
    const currentRef = gameAreaRef.current; // Capture ref for cleanup

    const moveListener = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const upListener = () => handleMouseUp();

    if (stickmanState.isBeingDragged) {
      document.addEventListener('mousemove', moveListener);
      document.addEventListener('mouseup', upListener);
      document.addEventListener('touchmove', moveListener);
      document.addEventListener('touchend', upListener);
    } else {
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
      document.removeEventListener('touchmove', moveListener);
      document.removeEventListener('touchend', upListener);
    }
    return () => {
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
      document.removeEventListener('touchmove', moveListener);
      document.removeEventListener('touchend', upListener);
    };
  }, [stickmanState.isBeingDragged, handleMouseMove, handleMouseUp]);

  const handleInteraction = () => {
    if (stickmanState.isBeingDragged) return; // Don't trigger hit if it was part of a drag release

    toast({
      title: "Anil Khadku Whacked!",
      description: "He really felt that one!",
    });

    const knockbackX = (Math.random() - 0.5) * 40; // Increased knockback X (-20 to 20)
    const knockbackY = (Math.random() - 0.5) * 20 - 10; // Increased knockback Y, tending upwards a bit (-20 to 0)

    setStickmanState(prev => ({ 
      ...prev, 
      isHit: true, 
      x: prev.x + knockbackX,
      y: prev.y + knockbackY,
      rotation: (prev.rotation + (Math.random() > 0.5 ? 45 : -45) + (Math.random() -0.5) * 30 ) % 360  // More vigorous rotation
    }));
    setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500); 
  };
  
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
        // Create a synthetic mouse event
        const touch = e.touches[0];
        const pseudoMouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
            nativeEvent: e.nativeEvent // Pass through the native touch event
        } as unknown as React.MouseEvent<SVGSVGElement>;
        handleMouseDown(pseudoMouseEvent);
    }
  };


  return (
    <Card 
      ref={gameAreaRef} 
      className="h-full flex items-center justify-center relative overflow-hidden shadow-xl bg-muted/30 border-2 border-dashed border-accent/50 touch-none" // Added touch-none
      onTouchStartCapture={(e) => { // Capture phase to prevent default page scroll/zoom on touch
        if (e.target === gameAreaRef.current || gameAreaRef.current?.contains(e.target as Node) ) {
           // Potentially prevent default if needed, but AnilKhadku's onTouchStart handles its own
        }
      }}
    >
      <CardContent className="w-full h-full flex items-center justify-center p-0 relative">
        <AnilKhadku
          state={stickmanState}
          onMouseDown={handleMouseDown}
          onClick={handleInteraction} 
          onTouchStart={handleTouchStart}
        />
      </CardContent>
       <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground text-sm p-2 bg-background/80 rounded-md select-none">
        Drag or click Anil Khadku!
      </div>
    </Card>
  );
}
