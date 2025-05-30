
"use client"; 

import { useState } from 'react';
import type { StickmanState } from '@/lib/types'; // Weapon and SessionStats might be unused now
import { GameArea } from '@/components/game/game-area';
import { Separator } from '@/components/ui/separator';
// Removed imports for unused weapon icons and types

// Removed initialWeapons array

export default function GamePage() {
  // Removed state for availableWeapons, selectedWeapon, sessionStats
  // Removed useToast as it's handled within GameArea or not needed at this level anymore

  // Removed handleSelectWeapon, updateSessionStats, handleAddSuggestedWeapon functions

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-4 md:p-6 lg:p-8 bg-background">
      <header className="mb-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-anton text-primary tracking-tight">
          Anil Khadku's Revenge
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Unleash your creativity on the unfortunate Anil Khadku!
        </p>
      </header>
      
      <Separator className="my-4 md:my-6" />

      <main className="flex-grow grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6 min-h-0"> {/* Changed md:grid-cols-4 to md:grid-cols-1 */}
        {/* Left Panel, Right Panel Removed */}

        {/* Center Panel: Game Area - now spans full width */}
        <div className="md:col-span-1 min-h-[300px] md:min-h-0 h-full"> {/* Changed md:col-span-2 to md:col-span-1 (as it's the only column) and ensured it takes full height */}
          <GameArea 
            // Removed selectedWeapon, sessionStats, updateSessionStats props
            // GameArea will handle its own internal state or simplified interaction logic
          />
        </div>
      </main>
    </div>
  );
}
