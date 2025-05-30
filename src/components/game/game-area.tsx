
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { StickmanState } from '@/lib/types';
import { AnilKhadku } from './anil-khadku';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const GRAVITY = 0.6;
const FRICTION = 0.99; // Air friction
const GROUND_FRICTION = 0.9;
const RESTITUTION = 0.6; // Bounciness
const THROW_VELOCITY_MULTIPLIER = 1.5; // Adjusted for new velocity calculation
const STICKMAN_WIDTH = 48; 
const STICKMAN_HEIGHT = 72; 
const CLICK_IMPULSE_STRENGTH = 15;
const TARGET_FRAME_TIME_S = 1 / 60; // Assuming 60 FPS for physics scaling

export function GameArea() {
  const [stickmanState, setStickmanState] = useState<StickmanState>({
    x: 200, 
    y: 100, 
    vx: 0,
    vy: 0,
    rotation: 0,
    isBeingDragged: false,
    isHit: false,
  });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dragStartOffsetRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  // Store last two points with timestamps for velocity calculation
  const lastMousePositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  const previousMousePositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  
  const animationFrameIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const gameLoop = useCallback(() => {
    if (!gameAreaRef.current) return;

    setStickmanState(prev => {
      if (prev.isBeingDragged) {
        return prev; 
      }

      let { x, y, vx, vy, rotation } = prev; // isHit is handled by interaction
      const gameAreaRect = gameAreaRef.current!.getBoundingClientRect();
      
      vy += GRAVITY;
      vx *= FRICTION;
      vy *= FRICTION;

      x += vx;
      y += vy;

      const floorY = gameAreaRect.height - STICKMAN_HEIGHT / 2;
      if (y >= floorY) {
        y = floorY;
        vy *= -RESTITUTION; 
        vx *= GROUND_FRICTION; 
        if (Math.abs(vy) < 1) vy = 0; 
        if (Math.abs(vx) < 0.1) vx = 0;
      }

      const leftWallX = STICKMAN_WIDTH / 2;
      const rightWallX = gameAreaRect.width - STICKMAN_WIDTH / 2;
      if (x <= leftWallX) {
        x = leftWallX;
        vx *= -RESTITUTION;
      } else if (x >= rightWallX) {
        x = rightWallX;
        vx *= -RESTITUTION;
      }
      
      const ceilingY = STICKMAN_HEIGHT / 2;
      if (y <= ceilingY) {
        y = ceilingY;
        vy *= -RESTITUTION;
      }

      if(Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
         rotation = (rotation + vx * 0.5) % 360;
      }
      
      return { ...prev, x, y, vx, vy, rotation }; // Removed isHit from here, it's event-driven
    });

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameLoop]);


  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!gameAreaRef.current) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const clickXInGameArea = clientX - gameAreaRect.left;
    const clickYInGameArea = clientY - gameAreaRect.top;

    setStickmanState(prev => {
      dragStartOffsetRef.current = {
        offsetX: clickXInGameArea - prev.x,
        offsetY: clickYInGameArea - prev.y,
      };
      const now = Date.now();
      lastMousePositionRef.current = { x: clientX, y: clientY, timestamp: now };
      previousMousePositionRef.current = { x: clientX, y: clientY, timestamp: now }; // Initialize previous to current

      return { 
        ...prev, 
        isBeingDragged: true, 
        isHit: false, 
        vx: 0, 
        vy: 0 
      };
    });
  };

  const handleMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!gameAreaRef.current || !dragStartOffsetRef.current) return;

    // These are captured at the start of the event, stable for this handler invocation
    const currentDragOffsetX = dragStartOffsetRef.current.offsetX;
    const currentDragOffsetY = dragStartOffsetRef.current.offsetY;

    const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
    
    // Update previous mouse position before updating the last one
    if (lastMousePositionRef.current) {
      previousMousePositionRef.current = { ...lastMousePositionRef.current };
    }
    lastMousePositionRef.current = { x: clientX, y: clientY, timestamp: Date.now() };
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const mouseXInGameArea = clientX - gameAreaRect.left;
    const mouseYInGameArea = clientY - gameAreaRect.top;

    setStickmanState(prev => {
      // Only update position if dragging is still active according to the latest state
      if (!prev.isBeingDragged) return prev; 
      
      return {
        ...prev,
        x: mouseXInGameArea - currentDragOffsetX,
        y: mouseYInGameArea - currentDragOffsetY,
      };
    });
  }, []); // Empty deps: setStickmanState is stable, refs are stable

  const handleMouseUp = useCallback(() => {
    setStickmanState(prev => {
      if (!prev.isBeingDragged) return prev;

      let throwVx = 0;
      let throwVy = 0;

      if (lastMousePositionRef.current && previousMousePositionRef.current && 
          previousMousePositionRef.current.timestamp < lastMousePositionRef.current.timestamp) {
        
        const dx = lastMousePositionRef.current.x - previousMousePositionRef.current.x;
        const dy = lastMousePositionRef.current.y - previousMousePositionRef.current.y;
        const dtSeconds = (lastMousePositionRef.current.timestamp - previousMousePositionRef.current.timestamp) / 1000;

        if (dtSeconds > 0.001) { // Avoid division by zero or tiny dt
          // Convert velocity (pixels/sec) to (pixels/frame)
          const velocityScale = TARGET_FRAME_TIME_S * THROW_VELOCITY_MULTIPLIER;
          throwVx = (dx / dtSeconds) * velocityScale;
          throwVy = (dy / dtSeconds) * velocityScale;
          
          const maxThrowSpeed = 30; // Max speed in pixels/frame
          throwVx = Math.max(-maxThrowSpeed, Math.min(maxThrowSpeed, throwVx));
          throwVy = Math.max(-maxThrowSpeed, Math.min(maxThrowSpeed, throwVy));
        } else {
           // Fallback for very fast flicks or no movement
           throwVx = (Math.random() - 0.5) * 5; 
           throwVy = (Math.random() - 0.5) * 5 - 2; // Slight upward bias
        }
      } else {
        // Fallback if not enough data (e.g. click release without much drag)
        throwVx = (Math.random() - 0.5) * 3;
        throwVy = (Math.random() - 0.5) * 3 -1;
      }
      
      return { 
        ...prev, 
        isBeingDragged: false,
        vx: throwVx, 
        vy: throwVy,
      };
    });
    
    // Clear refs after state update is queued
    dragStartOffsetRef.current = null;
    lastMousePositionRef.current = null;
    previousMousePositionRef.current = null;
  }, [THROW_VELOCITY_MULTIPLIER]); // THROW_VELOCITY_MULTIPLIER is a const effectively

  useEffect(() => {
    // handleMouseMove and handleMouseUp are stable due to their useCallback deps
    const moveListener = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const upListener = () => handleMouseUp();

    if (stickmanState.isBeingDragged) {
      document.addEventListener('mousemove', moveListener);
      document.addEventListener('mouseup', upListener);
      document.addEventListener('touchmove', moveListener, { passive: false });
      document.addEventListener('touchend', upListener);
    } else {
      // Cleanup listeners when not dragging
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
      document.removeEventListener('touchmove', moveListener);
      document.removeEventListener('touchend', upListener);
    }

    // This return function is the cleanup for the useEffect hook
    return () => {
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
      document.removeEventListener('touchmove', moveListener);
      document.removeEventListener('touchend', upListener);
    };
  }, [stickmanState.isBeingDragged, handleMouseMove, handleMouseUp]);


  const handleInteraction = () => { 
    if (stickmanState.isBeingDragged) return;

    toast({
      title: "Anil Khadku Poked!",
      description: "He's not amused!",
    });

    const hitAngle = Math.random() * Math.PI * 2;
    
    setStickmanState(prev => ({ 
      ...prev, 
      isHit: true, 
      vx: prev.vx + Math.cos(hitAngle) * CLICK_IMPULSE_STRENGTH,
      vy: prev.vy + Math.sin(hitAngle) * CLICK_IMPULSE_STRENGTH - 5, 
      rotation: (prev.rotation + (Math.random() -0.5) * 90 ) % 360
    }));
    setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500); 
  };
  
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
        e.preventDefault(); 
        const touch = e.touches[0];
        // Simulate a MouseEvent for handleMouseDown
        const pseudoMouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
        } as unknown as React.MouseEvent<SVGSVGElement>; // Cast needed for type compatibility
        handleMouseDown(pseudoMouseEvent);
    }
  };

  return (
    <Card 
      ref={gameAreaRef} 
      className="h-full flex items-center justify-center relative overflow-hidden shadow-xl bg-muted/30 border-2 border-dashed border-accent/50 touch-none select-none"
      style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
    >
      <CardContent className="w-full h-full flex items-center justify-center p-0 relative">
        <AnilKhadku
          state={stickmanState}
          width={STICKMAN_WIDTH}
          height={STICKMAN_HEIGHT}
          onMouseDown={handleMouseDown}
          onClick={handleInteraction} 
          onTouchStart={handleTouchStart}
          style={{ willChange: 'transform, top, left' }}
        />
      </CardContent>
       <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground text-sm p-2 bg-background/80 rounded-md select-none pointer-events-none">
        Drag, throw, or click Anil Khadku!
      </div>
    </Card>
  );
}

