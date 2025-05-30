export interface Weapon {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  damage: number; // Example property
  uses?: number; // Optional: track uses for this specific weapon instance
}

export interface SessionStats {
  totalDamageInflicted: number;
  weaponUses: Record<string, number>; // Weapon ID -> count
  // Add more stats as needed
}

export interface StickmanState {
  x: number;
  y: number;
  rotation: number;
  isBeingDragged: boolean;
  isHit: boolean;
  // Add more states like health, expression, etc.
}
