
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { StickmanState, Weapon } from '@/lib/types';
import { AnilKhadku } from './anil-khadku';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Rocket, MousePointerSquare, Target, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRAVITY = 0.6;
const FRICTION = 0.99; // Air friction
const GROUND_FRICTION = 0.9;
const RESTITUTION = 0.6; // Bounciness
const THROW_VELOCITY_MULTIPLIER = 1.5;
const STICKMAN_WIDTH = 48;
const STICKMAN_HEIGHT = 72;
const CLICK_IMPULSE_STRENGTH = 15;
const WEAPON_IMPULSE_STRENGTH = 25;
const TARGET_FRAME_TIME_S = 1 / 60; // Assuming 60 FPS for physics scaling

const initialWeapons: Weapon[] = [
  { id: 'missile', name: 'Missile', icon: Rocket, description: 'Explosive fun!', damage: 50 },
  { id: 'gun', name: 'Gun', icon: MousePointerSquare, description: 'Precision shot.', damage: 30 },
  { id: 'bow', name: 'Bow', icon: Target, description: 'Archery skills.', damage: 25 },
];

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
  const lastMousePositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  const previousMousePositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);

  const animationFrameIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const [availableWeapons] = useState<Weapon[]>(initialWeapons);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStartPoint, setAimStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [aimEndPoint, setAimEndPoint] = useState<{ x: number; y: number } | null>(null);

  const gameLoop = useCallback(() => {
    if (!gameAreaRef.current) return;

    setStickmanState(prev => {
      if (prev.isBeingDragged) {
        return prev;
      }

      let { x, y, vx, vy, rotation } = prev;
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

      return { ...prev, x, y, vx, vy, rotation };
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

  const fireWeapon = useCallback((start: {x: number, y: number}, end: {x: number, y: number}) => {
    const selectedWeapon = availableWeapons.find(w => w.id === selectedWeaponId);
    if (!selectedWeapon || !gameAreaRef.current) return;

    // Simple collision: check if end point is within stickman bounds
    const stickmanRect = {
      left: stickmanState.x - STICKMAN_WIDTH / 2,
      right: stickmanState.x + STICKMAN_WIDTH / 2,
      top: stickmanState.y - STICKMAN_HEIGHT / 2,
      bottom: stickmanState.y + STICKMAN_HEIGHT / 2,
    };

    const hit = end.x >= stickmanRect.left && end.x <= stickmanRect.right &&
                end.y >= stickmanRect.top && end.y <= stickmanRect.bottom;

    if (hit) {
      toast({
        title: `${selectedWeapon.name} Hit!`,
        description: `Anil felt that one!`,
      });

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      const impulseVx = magnitude > 0 ? (dx / magnitude) * WEAPON_IMPULSE_STRENGTH : (Math.random() - 0.5) * WEAPON_IMPULSE_STRENGTH;
      const impulseVy = magnitude > 0 ? (dy / magnitude) * WEAPON_IMPULSE_STRENGTH : (Math.random() - 0.5) * WEAPON_IMPULSE_STRENGTH - 5;


      setStickmanState(prev => ({
        ...prev,
        isHit: true,
        vx: prev.vx + impulseVx,
        vy: prev.vy + impulseVy,
        rotation: (prev.rotation + (Math.random() -0.5) * 180 ) % 360
      }));
      setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500);
    } else {
      toast({
        title: "Missed!",
        description: `Better luck next time.`,
        variant: "destructive"
      });
    }
  }, [selectedWeaponId, stickmanState.x, stickmanState.y, availableWeapons, toast ]);


  const handleGameAreaMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedWeaponId || !gameAreaRef.current) return;
    // Prevent starting aim if click is on Anil Khadku (handled by AnilKhadku's onMouseDown)
    if ((e.target as HTMLElement).closest_internal_prop_do_not_use === 'AnilKhadkuSVG') return;


    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - gameAreaRect.left;
    const mouseY = e.clientY - gameAreaRect.top;

    setIsAiming(true);
    setAimStartPoint({ x: mouseX, y: mouseY });
    setAimEndPoint({ x: mouseX, y: mouseY });
  }, [selectedWeaponId]);

  const handleGlobalMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isAiming || !aimStartPoint || !gameAreaRef.current) return;

    const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const mouseX = clientX - gameAreaRect.left;
    const mouseY = clientY - gameAreaRect.top;
    setAimEndPoint({ x: mouseX, y: mouseY });

    // For dragging Anil
    if (stickmanState.isBeingDragged && dragStartOffsetRef.current && !selectedWeaponId) {
        const currentDragOffsetX = dragStartOffsetRef.current.offsetX;
        const currentDragOffsetY = dragStartOffsetRef.current.offsetY;

        if (lastMousePositionRef.current) {
          previousMousePositionRef.current = { ...lastMousePositionRef.current };
        }
        lastMousePositionRef.current = { x: clientX, y: clientY, timestamp: Date.now() };

        setStickmanState(prev => {
            if (!prev.isBeingDragged) return prev;
            return {
                ...prev,
                x: mouseX - currentDragOffsetX,
                y: mouseY - currentDragOffsetY,
            };
        });
    }
  }, [isAiming, aimStartPoint, stickmanState.isBeingDragged, selectedWeaponId]);


  const handleGlobalMouseUp = useCallback(() => {
    if (isAiming && aimStartPoint && aimEndPoint) {
      fireWeapon(aimStartPoint, aimEndPoint);
      setIsAiming(false);
      setAimStartPoint(null);
      setAimEndPoint(null);
    }

    // For dragging Anil
    if (stickmanState.isBeingDragged && !selectedWeaponId) {
        let throwVx = 0;
        let throwVy = 0;

        if (lastMousePositionRef.current && previousMousePositionRef.current &&
            previousMousePositionRef.current.timestamp < lastMousePositionRef.current.timestamp) {
            const dx = lastMousePositionRef.current.x - previousMousePositionRef.current.x;
            const dy = lastMousePositionRef.current.y - previousMousePositionRef.current.y;
            const dtSeconds = (lastMousePositionRef.current.timestamp - previousMousePositionRef.current.timestamp) / 1000;

            if (dtSeconds > 0.001) {
                const velocityScale = TARGET_FRAME_TIME_S * THROW_VELOCITY_MULTIPLIER;
                throwVx = (dx / dtSeconds) * velocityScale;
                throwVy = (dy / dtSeconds) * velocityScale;
                const maxThrowSpeed = 30;
                throwVx = Math.max(-maxThrowSpeed, Math.min(maxThrowSpeed, throwVx));
                throwVy = Math.max(-maxThrowSpeed, Math.min(maxThrowSpeed, throwVy));
            } else {
                throwVx = (Math.random() - 0.5) * 5;
                throwVy = (Math.random() - 0.5) * 5 - 2;
            }
        } else {
            throwVx = (Math.random() - 0.5) * 3;
            throwVy = (Math.random() - 0.5) * 3 -1;
        }
        setStickmanState(prev => {
            if (!prev.isBeingDragged) return prev;
            return { ...prev, isBeingDragged: false, vx: throwVx, vy: throwVy };
        });
        dragStartOffsetRef.current = null;
        lastMousePositionRef.current = null;
        previousMousePositionRef.current = null;
    }
  }, [isAiming, aimStartPoint, aimEndPoint, fireWeapon, stickmanState.isBeingDragged, selectedWeaponId]);


  useEffect(() => {
    const moveListener = (e: MouseEvent | TouchEvent) => handleGlobalMouseMove(e);
    const upListener = () => handleGlobalMouseUp();

    if (isAiming || (stickmanState.isBeingDragged && !selectedWeaponId)) {
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
  }, [isAiming, stickmanState.isBeingDragged, handleGlobalMouseMove, handleGlobalMouseUp, selectedWeaponId]);


  const handleAnilKhadkuMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault(); // Prevent text selection or other default browser actions
    e.stopPropagation(); // Prevent game area mousedown if clicking on Anil

    if (selectedWeaponId) {
      // Fire weapon directly at Anil
      const selectedWeapon = availableWeapons.find(w => w.id === selectedWeaponId);
      toast({
          title: `Firing ${selectedWeapon?.name || 'weapon'}!`,
          description: `Direct hit on Anil!`,
      });
      // Use Anil's center as both start and end for simplicity, or just end
      const anilCenter = { x: stickmanState.x, y: stickmanState.y };
      fireWeapon(anilCenter, anilCenter); // start and end are same for direct hit
    } else {
      // Regular drag initiation
      if (!gameAreaRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
      const mouseXInGameArea = clientX - gameAreaRect.left;
      const mouseYInGameArea = clientY - gameAreaRect.top;

      dragStartOffsetRef.current = {
        offsetX: mouseXInGameArea - stickmanState.x,
        offsetY: mouseYInGameArea - stickmanState.y,
      };
      const now = Date.now();
      lastMousePositionRef.current = { x: clientX, y: clientY, timestamp: now };
      previousMousePositionRef.current = { ...lastMousePositionRef.current };

      setStickmanState(prev => ({
        ...prev,
        x: stickmanState.x,
        y: stickmanState.y,
        isBeingDragged: true,
        isHit: false,
        vx: 0,
        vy: 0,
      }));
    }
  }, [selectedWeaponId, stickmanState.x, stickmanState.y, fireWeapon, toast, availableWeapons]);

  const handleAnilKhadkuClick = useCallback(() => {
    // This click is for non-weapon interaction (poke)
    if (selectedWeaponId || stickmanState.isBeingDragged) return; // Already handled by mousedown or drag

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
  }, [selectedWeaponId, stickmanState.isBeingDragged, toast]);


  const handleAnilKhadkuTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
        // For touch, if a weapon is selected, a tap on Anil is a direct fire.
        // If no weapon, it starts a drag.
        // This logic is similar to handleAnilKhadkuMouseDown.
        const touch = e.touches[0];
        const pseudoMouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation(),
            target: e.target, // Pass target along
        } as unknown as React.MouseEvent<SVGSVGElement>;
        handleAnilKhadkuMouseDown(pseudoMouseEvent);
    }
  }, [handleAnilKhadkuMouseDown]);


  const toggleWeapon = (weaponId: string) => {
    setSelectedWeaponId(prev => prev === weaponId ? null : weaponId);
    setIsAiming(false); // Reset aiming state if weapon changes
    setAimStartPoint(null);
    setAimEndPoint(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-muted/20 border-b border-border flex justify-center space-x-2">
        {availableWeapons.map(weapon => {
          const Icon = weapon.icon;
          return (
            <Button
              key={weapon.id}
              variant={selectedWeaponId === weapon.id ? "default" : "outline"}
              size="lg"
              onClick={() => toggleWeapon(weapon.id)}
              className={cn(
                "flex-col h-auto p-2",
                selectedWeaponId === weapon.id && "ring-2 ring-primary-foreground ring-offset-2 ring-offset-primary"
              )}
              title={weapon.name}
            >
              <Icon className={cn("h-8 w-8 mb-1", selectedWeaponId === weapon.id ? "text-primary-foreground": "text-primary")} />
              <span className="text-xs">{weapon.name}</span>
            </Button>
          );
        })}
        <Button
            key="none"
            variant={selectedWeaponId === null ? "secondary": "outline"}
            size="lg"
            onClick={() => toggleWeapon("")} // Pass empty string or specific logic for "none"
            className={cn(
              "flex-col h-auto p-2",
               selectedWeaponId === null && "ring-2 ring-secondary-foreground ring-offset-2 ring-offset-secondary"
            )}
            title="No Weapon (Drag/Poke)"
          >
            <Ban className={cn("h-8 w-8 mb-1", selectedWeaponId === null ? "text-secondary-foreground": "text-muted-foreground")} />
            <span className="text-xs">None</span>
        </Button>
      </div>
      <Card
        ref={gameAreaRef}
        className="flex-grow flex items-center justify-center relative overflow-hidden shadow-xl bg-muted/30 border-2 border-dashed border-accent/50 touch-none select-none"
        style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
        onMouseDown={handleGameAreaMouseDown} // For aiming on game area background
        // onTouchStart for game area aiming (TODO if needed, complex with Anil's touch)
      >
        <CardContent className="w-full h-full flex items-center justify-center p-0 relative">
          <AnilKhadku
            state={stickmanState}
            width={STICKMAN_WIDTH}
            height={STICKMAN_HEIGHT}
            onMouseDown={handleAnilKhadkuMouseDown} // Handles drag OR direct fire
            onClick={handleAnilKhadkuClick} // Handles poke IF no weapon selected
            onTouchStart={handleAnilKhadkuTouchStart} // Handles touch drag OR direct fire
            style={{ willChange: 'transform, top, left' }}
            // Add a custom prop to identify the SVG element to avoid aiming conflict
            // This is a bit of a hack, a more robust way would be event.target checks or refs
            // but for simplicity:
            // @ts-ignore
            closest_internal_prop_do_not_use="AnilKhadkuSVG"
          />
          {isAiming && aimStartPoint && aimEndPoint && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1={aimStartPoint.x}
                y1={aimStartPoint.y}
                x2={aimEndPoint.x}
                y2={aimEndPoint.y}
                stroke="hsl(var(--accent))"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
               <circle cx={aimEndPoint.x} cy={aimEndPoint.y} r="5" fill="hsl(var(--accent))" />
            </svg>
          )}
        </CardContent>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground text-sm p-2 bg-background/80 rounded-md select-none pointer-events-none">
          {selectedWeaponId ? "Click & drag to aim, or click Anil to fire!" : "Drag, throw, or click Anil Khadku!"}
        </div>
      </Card>
    </div>
  );
}
