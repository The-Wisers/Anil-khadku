"use client"; // Top-level page needs to be client component for state management

import { useState } from 'react';
import type { Weapon, SessionStats } from '@/lib/types';
import { GameArea } from '@/components/game/game-area';
import { WeaponSelection } from '@/components/game/weapon-selection';
import { AiWeaponSuggestion } from '@/components/game/ai-weapon-suggestion';
import { SessionStatsDisplay } from '@/components/game/session-stats';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalDamageInflicted: 0,
    weaponUses: {},
  });

  const handleSelectWeapon = (weapon: Weapon) => {
    setSelectedWeapon(weapon);
  };

  const updateSessionStats = (updater: Partial<SessionStats> | ((prev: SessionStats) => SessionStats)) => {
    if (typeof updater === 'function') {
      setSessionStats(updater);
    } else {
      setSessionStats(prev => ({ ...prev, ...updater }));
    }
  };
  
  // This function is a placeholder for adding AI suggested weapons to the list.
  // For this scaffold, it's not fully implemented into WeaponSelection.
  const handleAddSuggestedWeapon = (weapon: Weapon) => {
    // In a real app, you might add this to availableWeapons list dynamically
    console.log("Suggested weapon to add:", weapon);
    // Potentially select it automatically:
    // setSelectedWeapon(weapon); 
  };

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

      <main className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 min-h-0">
        {/* Left Panel: Weapon Selection and AI Suggestion */}
        <div className="md:col-span-1 flex flex-col gap-4 min-h-0">
          <div className="flex-grow min-h-[200px] md:min-h-0">
            <WeaponSelection selectedWeapon={selectedWeapon} onSelectWeapon={handleSelectWeapon} />
          </div>
          <AiWeaponSuggestion onAddSuggestedWeapon={handleAddSuggestedWeapon} />
        </div>

        {/* Center Panel: Game Area */}
        <div className="md:col-span-2 min-h-[300px] md:min-h-0">
          <GameArea 
            selectedWeapon={selectedWeapon}
            sessionStats={sessionStats}
            updateSessionStats={updateSessionStats}
          />
        </div>

        {/* Right Panel: Session Stats */}
        <div className="md:col-span-1 min-h-[200px] md:min-h-0">
          <SessionStatsDisplay stats={sessionStats} />
        </div>
      </main>
    </div>
  );
}
