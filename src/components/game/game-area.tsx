
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { StickmanState, Weapon } from '@/lib/types';
import { AnilKhadku } from './anil-khadku';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Crosshair, Target, Ban, Bomb } from 'lucide-react'; // Added Bomb for explosion placeholder
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
const MISSILE_IMPULSE_STRENGTH = 40;
const MISSILE_SPEED = 10; // pixels per frame
const TARGET_FRAME_TIME_S = 1 / 60;

const initialWeapons: Weapon[] = [
  { id: 'missile', name: 'Missile', icon: Rocket, description: 'Explosive fun!', damage: 50 },
  { id: 'gun', name: 'Gun', icon: Crosshair, description: 'Precision shot.', damage: 30 },
  { id: 'bow', name: 'Bow', icon: Target, description: 'Archery skills.', damage: 25 },
];

interface MissileState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  endX: number;
  endY: number;
  rotation: number;
  targetIsAnil: boolean;
}

interface ExplosionState {
  active: boolean;
  x: number;
  y: number;
  id: number; // To re-trigger animation
}

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
  const stickmanStateRef = useRef(stickmanState);
  const missileStateRef = useRef<MissileState | null>(null);


  const animationFrameIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const [availableWeapons] = useState<Weapon[]>(initialWeapons);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStartPoint, setAimStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [aimEndPoint, setAimEndPoint] = useState<{ x: number; y: number } | null>(null);

  const [missile, setMissile] = useState<MissileState | null>(null);
  const [explosion, setExplosion] = useState<ExplosionState | null>(null);

  useEffect(() => {
    stickmanStateRef.current = stickmanState;
  }, [stickmanState]);

  useEffect(() => {
    missileStateRef.current = missile;
  }, [missile]);


  const processMissileArrival = useCallback((arrivedMissile: MissileState) => {
    setExplosion({ x: arrivedMissile.endX, y: arrivedMissile.endY, id: Date.now() });
    setTimeout(() => setExplosion(null), 500); // Explosion CSS animation duration

    if (arrivedMissile.targetIsAnil) {
      toast({ title: "Anil Khadku", description: "Ah ah ahh!" });
      
      const impulseAngle = Math.atan2(arrivedMissile.endY - arrivedMissile.startY, arrivedMissile.endX - arrivedMissile.startX);
      
      setStickmanState(prev => ({
        ...prev,
        isHit: true,
        vx: prev.vx + Math.cos(impulseAngle) * MISSILE_IMPULSE_STRENGTH,
        vy: prev.vy + Math.sin(impulseAngle) * MISSILE_IMPULSE_STRENGTH,
        rotation: (prev.rotation + (Math.random() - 0.5) * 360) % 360
      }));
      setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500);
    } else {
      toast({ title: "Missed!", description: "The missile went wide.", variant: "destructive" });
    }
    setMissile(null);
  }, [toast]);


  const gameLoop = useCallback(() => {
    if (missileStateRef.current && missileStateRef.current.active) {
      const currentMissile = missileStateRef.current;
      const dx = currentMissile.endX - currentMissile.currentX;
      const dy = currentMissile.endY - currentMissile.currentY;
      const distRemaining = Math.sqrt(dx * dx + dy * dy);

      if (distRemaining < MISSILE_SPEED) {
        processMissileArrival(currentMissile);
      } else {
        const moveX = (dx / distRemaining) * MISSILE_SPEED;
        const moveY = (dy / distRemaining) * MISSILE_SPEED;
        setMissile(prev => prev ? ({
          ...prev,
          currentX: prev.currentX + moveX,
          currentY: prev.currentY + moveY,
        }) : null);
      }
    }
    
    if (!gameAreaRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    setStickmanState(prev => {
      if (prev.isBeingDragged) {
        return prev; // Position updated by mouse move
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
        if (Math.abs(vx) < 0.1) vx = 0; // Stop micro-movements on ground
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


      if(Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) { // Only rotate if moving significantly
         rotation = (rotation + vx * 0.5) % 360; // Simple rotation based on horizontal velocity
      }


      return { ...prev, x, y, vx, vy, rotation };
    });

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
  }, [processMissileArrival]);


  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameLoop]);


  const handleFireSequence = useCallback((start: {x: number, y: number}, end: {x: number, y: number}, directClickOnAnil: boolean) => {
    const selectedWeapon = availableWeapons.find(w => w.id === selectedWeaponId);
    if (!selectedWeapon || !gameAreaRef.current) return;

    const currentStickmanPos = stickmanStateRef.current;
    const stickmanRect = {
      left: currentStickmanPos.x - STICKMAN_WIDTH / 2,
      right: currentStickmanPos.x + STICKMAN_WIDTH / 2,
      top: currentStickmanPos.y - STICKMAN_HEIGHT / 2,
      bottom: currentStickmanPos.y + STICKMAN_HEIGHT / 2,
    };
    
    const isTargetAnil = directClickOnAnil || 
        (end.x >= stickmanRect.left && end.x <= stickmanRect.right &&
         end.y >= stickmanRect.top && end.y <= stickmanRect.bottom);

    if (selectedWeapon.id === 'missile') {
        const dxAngle = end.x - start.x;
        const dyAngle = end.y - start.y;
        // Calculate rotation. Rocket icon points up-left, so +135 degree might be a good start.
        // Or more accurately: atan2 gives angle from positive x-axis. Rocket icon points up.
        // If Rocket points straight up (0, -1 vector), angle should be atan2(dy, dx) - 90 deg (or +270).
        const angle = Math.atan2(dyAngle, dxAngle) * (180 / Math.PI);


        setMissile({
            active: true,
            startX: start.x, startY: start.y,
            currentX: start.x, currentY: start.y,
            endX: end.x, endY: end.y,
            rotation: angle + 90, // Lucide Rocket points up, so add 90 to align with direction vector
            targetIsAnil: isTargetAnil,
        });
    } else { // For other weapons (gun, bow) - instant hit/miss
        if (isTargetAnil) {
            toast({
              title: `${selectedWeapon.name} Hit!`,
              description: `Anil felt that one!`,
            });

            const impulseDx = end.x - start.x;
            const impulseDy = end.y - start.y;
            const magnitude = Math.sqrt(impulseDx * impulseDx + impulseDy * impulseDy);
            const impulseVx = magnitude > 0 ? (impulseDx / magnitude) * WEAPON_IMPULSE_STRENGTH : (Math.random() - 0.5) * WEAPON_IMPULSE_STRENGTH;
            const impulseVy = magnitude > 0 ? (impulseDy / magnitude) * WEAPON_IMPULSE_STRENGTH : (Math.random() - 0.5) * WEAPON_IMPULSE_STRENGTH - 5; // a bit upwards

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
    }
  }, [selectedWeaponId, availableWeapons, toast, stickmanStateRef]);


  const handleGameAreaMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedWeaponId || !gameAreaRef.current || missile?.active) return;
    
    const targetIsAnilKhadku = (e.target as HTMLElement).closest('[data-id="AnilKhadkuSVG"]');
    if (targetIsAnilKhadku) { // Clicked on Anil, fire immediately
        const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
        const anilCenterX = stickmanStateRef.current.x;
        const anilCenterY = stickmanStateRef.current.y;
        // For direct fire, "start" can be arbitrary point away from Anil, or center of game area
        const fireStartX = gameAreaRect.width / 2;
        const fireStartY = gameAreaRect.height / 10; // From top-center
        handleFireSequence({ x: fireStartX, y: fireStartY }, { x: anilCenterX, y: anilCenterY }, true);
        return;
    }

    // Clicked on empty space, start aiming
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - gameAreaRect.left;
    const mouseY = e.clientY - gameAreaRect.top;

    setIsAiming(true);
    setAimStartPoint({ x: mouseX, y: mouseY });
    setAimEndPoint({ x: mouseX, y: mouseY });
  }, [selectedWeaponId, missile, handleFireSequence, stickmanStateRef]);

  const handleGameAreaTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && !missile?.active) {
      const touch = e.touches[0];
      // Create a synthetic event that mimics MouseEvent enough for handleGameAreaMouseDown
      const pseudoMouseEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          preventDefault: () => e.preventDefault(), // Important for touch
          stopPropagation: () => e.stopPropagation(),
          target: e.target, 
      } as unknown as React.MouseEvent<HTMLDivElement>;
      handleGameAreaMouseDown(pseudoMouseEvent);
    }
  }, [handleGameAreaMouseDown, missile]);

  const handleGlobalMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!gameAreaRef.current) return;

    const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const mouseX = clientX - gameAreaRect.left;
    const mouseY = clientY - gameAreaRect.top;

    if (isAiming && aimStartPoint && !missile?.active) {
      setAimEndPoint({ x: mouseX, y: mouseY });
    }

    if (stickmanStateRef.current.isBeingDragged && dragStartOffsetRef.current && !selectedWeaponId && !missile?.active) {
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
  }, [isAiming, aimStartPoint, selectedWeaponId, missile]);


  const handleGlobalMouseUp = useCallback(() => {
    if (isAiming && aimStartPoint && aimEndPoint && !missile?.active) {
      handleFireSequence(aimStartPoint, aimEndPoint, false);
      setIsAiming(false);
      setAimStartPoint(null);
      setAimEndPoint(null);
    }

    if (stickmanStateRef.current.isBeingDragged && !selectedWeaponId && !missile?.active) {
        let throwVx = 0;
        let throwVy = 0;

        if (lastMousePositionRef.current && previousMousePositionRef.current &&
            previousMousePositionRef.current.timestamp < lastMousePositionRef.current.timestamp) {
            const dx = lastMousePositionRef.current.x - previousMousePositionRef.current.x;
            const dy = lastMousePositionRef.current.y - previousMousePositionRef.current.y;
            const dtSeconds = (lastMousePositionRef.current.timestamp - previousMousePositionRef.current.timestamp) / 1000;

            if (dtSeconds > 0.001 && dtSeconds < 0.5) { // Check for plausible dt
                const velocityScale = TARGET_FRAME_TIME_S * THROW_VELOCITY_MULTIPLIER;
                throwVx = (dx / dtSeconds) * velocityScale;
                throwVy = (dy / dtSeconds) * velocityScale;
                const maxThrowSpeed = 40; // Increased max throw speed
                throwVx = Math.max(-maxThrowSpeed, Math.min(maxThrowSpeed, throwVx));
                throwVy = Math.max(-maxThrowSpeed, Math.min(maxThrowSpeed, throwVy));
            } else { // Fallback if dt is too small/large or no previous point
                throwVx = (Math.random() - 0.5) * 5;
                throwVy = (Math.random() - 0.5) * 5 - 2;
            }
        } else { // Fallback if no previous point
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
  }, [isAiming, aimStartPoint, aimEndPoint, handleFireSequence, selectedWeaponId, missile]);


  useEffect(() => {
    const moveListener = (e: MouseEvent | TouchEvent) => handleGlobalMouseMove(e);
    const upListener = () => handleGlobalMouseUp();

    if (isAiming || (stickmanStateRef.current.isBeingDragged && !selectedWeaponId && !missile?.active)) {
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
  }, [isAiming, handleGlobalMouseMove, handleGlobalMouseUp, selectedWeaponId, missile]);


  const handleAnilKhadkuMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (missile?.active) return; // Don't interact if missile is flying

    if (selectedWeaponId) {
      // Fire selected weapon directly at Anil
      const anilCenterX = stickmanStateRef.current.x;
      const anilCenterY = stickmanStateRef.current.y;
       // For direct fire, "start" can be arbitrary point away from Anil, or center of game area
      const fireStartX = gameAreaRef.current ? gameAreaRef.current.getBoundingClientRect().width / 2 : anilCenterX - 100;
      const fireStartY = gameAreaRef.current ? gameAreaRef.current.getBoundingClientRect().height / 10 : anilCenterY - 100; 
      
      handleFireSequence({ x: fireStartX, y: fireStartY }, { x: anilCenterX, y: anilCenterY }, true);
    } else { // No weapon selected, initiate drag
      if (!gameAreaRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
      const mouseXInGameArea = clientX - gameAreaRect.left;
      const mouseYInGameArea = clientY - gameAreaRect.top;

      dragStartOffsetRef.current = {
        offsetX: mouseXInGameArea - stickmanStateRef.current.x,
        offsetY: mouseYInGameArea - stickmanStateRef.current.y,
      };
      const now = Date.now();
      lastMousePositionRef.current = { x: clientX, y: clientY, timestamp: now };
      previousMousePositionRef.current = { ...lastMousePositionRef.current };

      setStickmanState(prev => ({
        ...prev,
        isBeingDragged: true,
        isHit: false, // Clear hit state on drag start
        vx: 0, // Stop momentum when grabbed
        vy: 0,
      }));
    }
  }, [selectedWeaponId, missile, handleFireSequence, stickmanStateRef]);

  const handleAnilKhadkuClick = useCallback(() => {
    if (selectedWeaponId || stickmanStateRef.current.isBeingDragged || missile?.active) return; 

    toast({
      title: "Anil Khadku Poked!",
      description: "He's not amused!",
    });
    const hitAngle = Math.random() * Math.PI * 2;
    setStickmanState(prev => ({
      ...prev,
      isHit: true,
      vx: prev.vx + Math.cos(hitAngle) * CLICK_IMPULSE_STRENGTH,
      vy: prev.vy + Math.sin(hitAngle) * CLICK_IMPULSE_STRENGTH - 5, // a bit upwards
      rotation: (prev.rotation + (Math.random() -0.5) * 90 ) % 360
    }));
    setTimeout(() => setStickmanState(prev => ({ ...prev, isHit: false })), 500);
  }, [selectedWeaponId, missile, toast, stickmanStateRef]);


  const handleAnilKhadkuTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1 && !missile?.active) {
        const touch = e.touches[0];
        const pseudoMouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation(),
            target: e.target, 
        } as unknown as React.MouseEvent<SVGSVGElement>;
        handleAnilKhadkuMouseDown(pseudoMouseEvent);
    }
  }, [handleAnilKhadkuMouseDown, missile]);


  const toggleWeapon = (weaponId: string) => {
    setSelectedWeaponId(prev => (prev === weaponId || weaponId === "") ? null : weaponId);
    setIsAiming(false); 
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
              disabled={missile?.active} // Disable weapon switch if missile is active
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
            onClick={() => toggleWeapon("")} 
            className={cn(
              "flex-col h-auto p-2",
               selectedWeaponId === null && "ring-2 ring-secondary-foreground ring-offset-2 ring-offset-secondary"
            )}
            title="No Weapon (Drag/Poke)"
            disabled={missile?.active}
          >
            <Ban className={cn("h-8 w-8 mb-1", selectedWeaponId === null ? "text-secondary-foreground": "text-muted-foreground")} />
            <span className="text-xs">None</span>
        </Button>
      </div>
      <Card
        ref={gameAreaRef}
        className="flex-grow flex items-center justify-center relative overflow-hidden shadow-xl bg-muted/30 border-2 border-dashed border-accent/50 touch-none select-none"
        style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
        onMouseDown={handleGameAreaMouseDown} 
        onTouchStart={handleGameAreaTouchStart}
      >
        <CardContent className="w-full h-full flex items-center justify-center p-0 relative">
          <AnilKhadku
            state={stickmanState}
            width={STICKMAN_WIDTH}
            height={STICKMAN_HEIGHT}
            onMouseDown={handleAnilKhadkuMouseDown} 
            onClick={handleAnilKhadkuClick} 
            onTouchStart={handleAnilKhadkuTouchStart} 
            style={{ willChange: 'transform, top, left' }}
            data-id="AnilKhadkuSVG" 
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
          {missile && missile.active && (
            <Rocket
              className="text-primary absolute pointer-events-none h-8 w-8" // Adjust size as needed
              style={{
                left: missile.currentX - 16, // Adjust for icon center
                top: missile.currentY - 16,  // Adjust for icon center
                transform: `rotate(${missile.rotation}deg)`,
                willChange: 'left, top, transform',
              }}
            />
          )}
          {explosion && explosion.active && (
             <div 
              key={explosion.id} 
              className="absolute rounded-full animate-explode pointer-events-none"
              style={{
                left: explosion.x,
                top: explosion.y,
                width: '10px', // Initial small size for explosion center
                height: '10px',
                transform: 'translate(-50%, -50%)', // Center the explosion
              }}
             />
          )}
        </CardContent>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground text-sm p-2 bg-background/80 rounded-md select-none pointer-events-none">
          {selectedWeaponId ? (missile?.active ? "Missile in flight..." : "Click & drag to aim, or click Anil to fire!") : "Drag, throw, or click Anil Khadku!"}
        </div>
      </Card>
    </div>
  );
}
