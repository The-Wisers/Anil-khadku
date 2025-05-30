import type { LucideIcon } from 'lucide-react';

export interface Weapon {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string; // Not used in this version, but good for future
  damage: number; // Not used in this version, but good for future
}

export interface SessionStats {
  totalDamageInflicted: number;
  weaponUses: Record<string, number>; // Weapon ID -> count
  // Add more stats as needed
}

export interface StickmanState {
  x: number; // Center X position in game area
  y: number; // Center Y position in game area
  vx: number; // Velocity X
  vy: number; // Velocity Y
  rotation: number;
  isBeingDragged: boolean;
  isHit: boolean;
  // Add more states like health, expression, etc.
}
