"use client";

import type { Weapon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WeaponItemProps {
  weapon: Weapon;
  isSelected: boolean;
  onSelect: (weapon: Weapon) => void;
}

export function WeaponItem({ weapon, isSelected, onSelect }: WeaponItemProps) {
  const Icon = weapon.icon;
  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-shadow cursor-pointer",
        isSelected && "ring-2 ring-primary shadow-xl border-primary"
      )}
      onClick={() => onSelect(weapon)}
    >
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          <CardTitle className="text-lg">{weapon.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription>{weapon.description}</CardDescription>
        <div className="mt-2 text-sm text-muted-foreground">Damage: {weapon.damage}</div>
      </CardContent>
    </Card>
  );
}
