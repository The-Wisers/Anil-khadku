
"use client";

import type { SessionStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Zap } from 'lucide-react';

interface SessionStatsProps {
  stats: SessionStats;
  // We might need a list of known weapon names if we only have IDs in stats
  // For now, we'll assume IDs are descriptive enough or this component gets more info.
}

export function SessionStatsDisplay({ stats }: SessionStatsProps) {
  const weaponUses = stats.weaponUses || {}; // Default to an empty object if undefined

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <ListChecks className="mr-2 h-7 w-7" />
          Session Stats
        </CardTitle>
        <CardDescription>Your performance in this session.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <h4 className="font-semibold text-lg flex items-center">
            <Zap className="mr-2 h-5 w-5 text-accent" />
            Total Damage Inflicted
          </h4>
          <p className="text-3xl font-bold text-primary">{stats.totalDamageInflicted}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg">Weapon Usage</h4>
          {Object.keys(weaponUses).length === 0 ? (
            <p className="text-muted-foreground">No weapons used yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {Object.entries(weaponUses).map(([weaponId, count]) => (
                <li key={weaponId}>
                  <span className="font-medium text-foreground">{weaponId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>: {count} times
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
