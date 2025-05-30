"use client";

import type { Weapon } from '@/lib/types';
import { WeaponItem } from './weapon-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HandMetal, BombIcon, ZapIcon } from 'lucide-react'; // Using HandMetal for Boxing Glove, BombIcon and ZapIcon as examples
import { BaseballBatIcon, FeatherDusterIcon, WaterBalloonIcon } from '@/components/icons/custom-icons';

const availableWeapons: Weapon[] = [
  { id: 'boxing-glove', name: 'Boxing Glove', icon: HandMetal, description: 'Packs a punch!', damage: 10 },
  { id: 'baseball-bat', name: 'Baseball Bat', icon: BaseballBatIcon, description: 'Home run!', damage: 15 },
  { id: 'feather-duster', name: 'Feather Duster', icon: FeatherDusterIcon, description: 'Tickle torture!', damage: 2 },
  { id: 'water-balloon', name: 'Water Balloon', icon: WaterBalloonIcon, description: 'Splash attack!', damage: 5 },
  { id: 'bomb', name: 'Cartoon Bomb', icon: BombIcon, description: 'Goes BOOM!', damage: 50 },
  { id: 'taser', name: 'Taser', icon: ZapIcon, description: 'Shocking, isn\'t it?', damage: 25 },
];

interface WeaponSelectionProps {
  selectedWeapon: Weapon | null;
  onSelectWeapon: (weapon: Weapon) => void;
}

export function WeaponSelection({ selectedWeapon, onSelectWeapon }: WeaponSelectionProps) {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Choose Your Weapon</CardTitle>
        <CardDescription>Select an item to interact with Anil Khadku.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea className="h-full pr-3">
          <div className="grid grid-cols-1 gap-4">
            {availableWeapons.map((weapon) => (
              <WeaponItem
                key={weapon.id}
                weapon={weapon}
                isSelected={selectedWeapon?.id === weapon.id}
                onSelect={onSelectWeapon}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
