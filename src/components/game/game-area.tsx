
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
const THROW_MULTIPLIER = 0.35;
const STICKMAN_WIDTH = 48; // Approximate width for collision
const STICKMAN_HEIGHT = 72; // Approximate height for collision
const CLICK_IMPULSE_STRENGTH = 15;

export function GameArea() {
  const [stickmanState, setStickmanState] = useState<StickmanState>({
    x: 200, // Initial center X
    y: 100, // Initial center Y
    vx: 0,
    vy: 0,
    rotation: 0,
    isBeingDragged: false,
    isHit: false,
  });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dragStartOffsetRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const gameLoop = useCallback(() => {
    if (!gameAreaRef.current) return;

    setStickmanState(prev => {
      if (prev.isBeingDragged) {
        return prev; // Physics doesn't apply while dragging
      }

      let { x, y, vx, vy, rotation, isHit } = prev;
      const gameAreaRect = gameAreaRef.current!.getBoundingClientRect();
      
      // Apply gravity
      vy += GRAVITY;

      // Apply air friction
      vx *= FRICTION;
      vy *= FRICTION;

      // Update position
      x += vx;
      y += vy;

      // Collision with floor (bottom boundary)
      const floorY = gameAreaRect.height - STICKMAN_HEIGHT / 2;
      if (y >= floorY) {
        y = floorY;
        vy *= -RESTITUTION; // Bounce
        vx *= GROUND_FRICTION; // Friction with ground
        if (Math.abs(vy) < 1) vy = 0; // Come to rest
         if (Math.abs(vx) < 0.1) vx = 0;
      }

      // Collision with walls (left/right boundaries)
      const leftWallX = STICKMAN_WIDTH / 2;
      const rightWallX = gameAreaRect.width - STICKMAN_WIDTH / 2;
      if (x <= leftWallX) {
        x = leftWallX;
        vx *= -RESTITUTION;
      } else if (x >= rightWallX) {
        x = rightWallX;
        vx *= -RESTITUTION;
      }
      
      // Collision with ceiling (top boundary)
      const ceilingY = STICKMAN_HEIGHT / 2;
      if (y <= ceilingY) {
        y = ceilingY;
        vy *= -RESTITUTION;
      }

      // Update rotation based on horizontal velocity (simple effect)
      if(Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
         rotation = (rotation + vx * 0.5) % 360;
      }
      
      return { ...prev, x, y, vx, vy, rotation, isHit };
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

    // Calculate offset from click point to stickman's current center
    const clickXInGameArea = clientX - gameAreaRect.left;
    const clickYInGameArea = clientY - gameAreaRect.top;
    
    dragStartOffsetRef.current = {
      offsetX: clickXInGameArea - stickmanState.x,
      offsetY: clickYInGameArea - stickmanState.y,
    };
    lastMousePositionRef.current = { x: clientX, y: clientY };

    setStickmanState(prev => ({ 
      ...prev, 
      isBeingDragged: true, 
      isHit: false, 
      vx: 0, // Stop physics movement while dragging
      vy: 0 
    }));
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!stickmanState.isBeingDragged || !gameAreaRef.current || !dragStartOffsetRef.current) {
      return;
    }
    
    // Capture the values from dragStartOffsetRef.current NOW, while it's guaranteed to be non-null
    const currentDragOffsetX = dragStartOffsetRef.current.offsetX;
    const currentDragOffsetY = dragStartOffsetRef.current.offsetY;

    const clientX = (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? 0;
    const clientY = (e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY ?? 0;
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    
    const mouseXInGameArea = clientX - gameAreaRect.left;
    const mouseYInGameArea = clientY - gameAreaRect.top;

    setStickmanState(prev => ({
      ...prev,
      x: mouseXInGameArea - currentDragOffsetX, // Use captured value
      y: mouseYInGameArea - currentDragOffsetY, // Use captured value
    }));
    lastMousePositionRef.current = { x: clientX, y: clientY };
  }, [stickmanState.isBeingDragged]);

  const handleMouseUp = useCallback(() => {
    if (stickmanState.isBeingDragged && lastMousePositionRef.current && dragStartOffsetRef.current) {
      // For throw velocity, ideally track a few recent mouse moves.
      // Simplified: use a fixed impulse or a very basic delta if needed.
      // For now, let's use a simple mechanism: if mouse moved, apply some velocity.
      // A more complex velocity calculation would be:
      // const dx = clientX - (lastMousePositionRef.current.x || clientX);
      // const dy = clientY - (lastMousePositionRef.current.y || clientY);
      // This would require clientX/Y from the mouseup event, which isn't directly passed here.
      // So we'll rely on the last recorded mouse move.
      
      // Calculate velocity based on overall drag displacement.
      // This is a simplification. True throw velocity depends on the final flick.
      // Let's use an average velocity from the drag if the drag was short,
      // or a fixed "release" impulse for now for simplicity.
      // A better approach would be to track mouse positions during mousemove and calculate velocity on mouseup.

      // Let's make the anil khadku thrown based on the last mouse direction
      // if (lastMousePositionRef.current && dragStartOffsetRef.current) // Already checked by isBeingDragged
      
      // Use a fixed throw impulse for simplicity, can be enhanced later
      // For a more dynamic throw, need to calculate velocity from last few mouse movements.
      // Let's make it so that the object continues with the velocity it had during the drag.
      // This requires continuously updating vx/vy during drag OR calculating on release.

      // For now, a simple throw based on the last movement vector:
      // This will be based on the *change* from initial drag point to release point.
      // This logic for velocity is simple and might not feel like a "flick".
      // Better: calculate based on last few mousemove events.
      // For now, let's try a placeholder fixed impulse
      const impulseX = (Math.random() - 0.5) * 20 * THROW_MULTIPLIER;
      const impulseY = -Math.random() * 15 * THROW_MULTIPLIER; // Bias upwards slightly
      
      setStickmanState(prev => ({ 
        ...prev, 
        isBeingDragged: false,
        vx: prev.vx + impulseX, // add to existing vx from physics if any before drag
        vy: prev.vy + impulseY,
      }));
    }
    dragStartOffsetRef.current = null;
    lastMousePositionRef.current = null; // Clear last mouse position
  }, [stickmanState.isBeingDragged]);

  useEffect(() => {
    const moveListener = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const upListener = () => handleMouseUp();

    if (stickmanState.isBeingDragged) {
      document.addEventListener('mousemove', moveListener);
      document.addEventListener('mouseup', upListener);
      document.addEventListener('touchmove', moveListener, { passive: false });
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

  const handleInteraction = () => { // Click interaction
    if (stickmanState.isBeingDragged) return;

    toast({
      title: "Anil Khadku Poked!",
      description: "He's not amused!",
    });

    const hitAngle = Math.random() * Math.PI * 2;
    const impulseStrength = CLICK_IMPULSE_STRENGTH;
    
    setStickmanState(prev => ({ 
      ...prev, 
      isHit: true, 
      vx: prev.vx + Math.cos(hitAngle) * impulseStrength,
      vy: prev.vy + Math.sin(hitAngle) * impulseStrength - 5, // slightly upward bias
      rotation: (prev.rotation + (Math.random() -0.5) * 90 ) % 360
    }));
    setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500); 
  };
  
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
        e.preventDefault(); // Prevent page scroll/zoom
        const touch = e.touches[0];
        const pseudoMouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
            nativeEvent: e.nativeEvent 
        } as unknown as React.MouseEvent<SVGSVGElement>;
        handleMouseDown(pseudoMouseEvent);
    }
  };

  return (
    <Card 
      ref={gameAreaRef} 
      className="h-full flex items-center justify-center relative overflow-hidden shadow-xl bg-muted/30 border-2 border-dashed border-accent/50 touch-none select-none"
      style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
      onTouchStartCapture={(e) => { 
        if (e.target === gameAreaRef.current || gameAreaRef.current?.contains(e.target as Node) ) {
           // e.preventDefault(); // Could be too aggressive here, handle in AnilKhadku's onTouchStart
        }
      }}
    >
      <CardContent className="w-full h-full flex items-center justify-center p-0 relative">
        {/* AnilKhadku is positioned absolutely by its own style prop now */}
        <AnilKhadku
          state={stickmanState}
          width={STICKMAN_WIDTH}
          height={STICKMAN_HEIGHT}
          onMouseDown={handleMouseDown}
          onClick={handleInteraction} 
          onTouchStart={handleTouchStart}
          style={{ willChange: 'transform, top, left' }} // Performance hint
        />
      </CardContent>
       <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground text-sm p-2 bg-background/80 rounded-md select-none pointer-events-none">
        Drag, throw, or click Anil Khadku!
      </div>
    </Card>
  );
}
