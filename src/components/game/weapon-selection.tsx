
"use client";

import type { Weapon } from '@/lib/types';
import { WeaponItem } from './weapon-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pickaxe } from 'lucide-react';


interface WeaponSelectionProps {
  availableWeapons: Weapon[];
  selectedWeapon: Weapon | null;
  onSelectWeapon: (weapon: Weapon) => void;
}

export function WeaponSelection({ availableWeapons, selectedWeapon, onSelectWeapon }: WeaponSelectionProps) {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Pickaxe className="mr-2 h-6 w-6"/> Choose Your Weapon
        </CardTitle>
        <CardDescription>Select an item to interact with Anil Khadku.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea className="h-full pr-3">
          {availableWeapons.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No weapons available. Try asking the AI!</p>
          ) : (
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
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
