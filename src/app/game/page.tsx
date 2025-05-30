
"use client"; 

import { useState } from 'react';
import type { Weapon, SessionStats } from '@/lib/types';
import { GameArea } from '@/components/game/game-area';
import { WeaponSelection } from '@/components/game/weapon-selection';
import { AiWeaponSuggestion } from '@/components/game/ai-weapon-suggestion';
import { SessionStatsDisplay } from '@/components/game/session-stats';
import { Separator } from '@/components/ui/separator';
import { HandMetal, BombIcon, ZapIcon, Wand2 } from 'lucide-react';
import { BaseballBatIcon, FeatherDusterIcon, WaterBalloonIcon } from '@/components/icons/custom-icons';
import { useToast } from '@/hooks/use-toast';


const initialWeapons: Weapon[] = [
  { id: 'boxing-glove', name: 'Boxing Glove', icon: HandMetal, description: 'Packs a punch!', damage: 10 },
  { id: 'baseball-bat', name: 'Baseball Bat', icon: BaseballBatIcon, description: 'Home run!', damage: 15 },
  { id: 'feather-duster', name: 'Feather Duster', icon: FeatherDusterIcon, description: 'Tickle torture!', damage: 2 },
  { id: 'water-balloon', name: 'Water Balloon', icon: WaterBalloonIcon, description: 'Splash attack!', damage: 5 },
  { id: 'bomb', name: 'Cartoon Bomb', icon: BombIcon, description: 'Goes BOOM!', damage: 50 },
  { id: 'taser', name: 'Taser', icon: ZapIcon, description: 'Shocking, isn\'t it?', damage: 25 },
];


export default function GamePage() {
  const [availableWeapons, setAvailableWeapons] = useState<Weapon[]>(initialWeapons);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalDamageInflicted: 0,
    weaponUses: {},
  });
  const { toast } = useToast();

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
  
  const handleAddSuggestedWeapon = (suggestedWeaponName: string, suggestedWeaponDescription: string) => {
    const newWeapon: Weapon = {
      id: `ai-${suggestedWeaponName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: suggestedWeaponName,
      icon: Wand2, // Default icon for AI suggested weapons
      description: suggestedWeaponDescription,
      damage: Math.floor(Math.random() * 35) + 10, // AI weapons are a bit stronger
    };

    setAvailableWeapons(prevWeapons => {
      // Avoid adding duplicates by name (simple check)
      if (prevWeapons.find(w => w.name === newWeapon.name)) {
        toast({
          title: "Weapon Exists",
          description: `A weapon named "${newWeapon.name}" already exists.`,
          variant: "default"
        });
        return prevWeapons;
      }
      toast({
        title: "New Weapon Added!",
        description: `"${newWeapon.name}" is now available for use.`,
      });
      return [...prevWeapons, newWeapon];
    });
    // Optionally, auto-select the new weapon
    // setSelectedWeapon(newWeapon);
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
            <WeaponSelection 
              availableWeapons={availableWeapons}
              selectedWeapon={selectedWeapon} 
              onSelectWeapon={handleSelectWeapon} 
            />
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
