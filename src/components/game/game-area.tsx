"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { StickmanState, Weapon, SessionStats } from '@/lib/types';
import { AnilKhadku } from './anil-khadku';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameAreaProps {
  selectedWeapon: Weapon | null;
  sessionStats: SessionStats;
  updateSessionStats: (newStats: Partial<SessionStats> | ((prev: SessionStats) => SessionStats)) => void;
}

export function GameArea({ selectedWeapon, sessionStats, updateSessionStats }: GameAreaProps) {
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
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      stickmanX: stickmanState.x,
      stickmanY: stickmanState.y,
    };
    setStickmanState(prev => ({ ...prev, isBeingDragged: true }));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current || !stickmanState.isBeingDragged) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setStickmanState(prev => ({
      ...prev,
      x: dragStartRef.current!.stickmanX + dx,
      y: dragStartRef.current!.stickmanY + dy,
    }));
  }, [stickmanState.isBeingDragged]);

  const handleMouseUp = useCallback(() => {
    if (stickmanState.isBeingDragged) {
      setStickmanState(prev => ({ ...prev, isBeingDragged: false }));
      // Simple "throw" effect - could be more complex
      // For now, just stop dragging.
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
    if (selectedWeapon) {
      toast({
        title: `Anil Khadku hit with ${selectedWeapon.name}!`,
        description: `Ouch! That must have hurt. +${selectedWeapon.damage} damage.`,
      });
      updateSessionStats(prev => ({
        totalDamageInflicted: prev.totalDamageInflicted + selectedWeapon.damage,
        weaponUses: {
          ...prev.weaponUses,
          [selectedWeapon.id]: (prev.weaponUses[selectedWeapon.id] || 0) + 1,
        }
      }));
    } else {
      toast({
        title: "Anil Khadku poked!",
        description: "He seems mildly annoyed.",
        variant: "default",
      });
      updateSessionStats(prev => ({
        totalDamageInflicted: prev.totalDamageInflicted + 1, // Poke damage
      }));
    }

    setStickmanState(prev => ({ ...prev, isHit: true }));
    setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500); // Duration of shake animation
  };

  return (
    <Card ref={gameAreaRef} className="flex-1 flex items-center justify-center relative overflow-hidden shadow-xl bg-muted/30 border-2 border-dashed border-accent/50">
      <CardContent className="w-full h-full flex items-center justify-center p-0">
        <AnilKhadku
          state={stickmanState}
          onMouseDown={handleMouseDown}
          onClick={handleInteraction} // Also allow click to interact if not dragging
          onTouchStart={(e) => { // Basic touch support
             if (e.touches[0]) {
                const pseudoMouseEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, preventDefault: () => e.preventDefault() } as unknown as React.MouseEvent<SVGSVGElement>;
                handleMouseDown(pseudoMouseEvent);
             }
          }}
        />
      </CardContent>
      <div className="absolute bottom-4 right-4">
        <Button onClick={handleInteraction} variant="destructive" size="lg" disabled={!selectedWeapon}>
          <Target className="mr-2 h-6 w-6" /> Use {selectedWeapon ? selectedWeapon.name : "Weapon"}
        </Button>
      </div>
       <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground text-sm p-2 bg-background/80 rounded-md">
        Drag or click Anil Khadku!
      </div>
    </Card>
  );
}
