"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Weapon } from '@/lib/types';
import { suggestTrendingWeapon, type SuggestTrendingWeaponOutput } from '@/ai/flows/weapon-suggestion'; // Assuming it's made client-callable or via API

// Placeholder for custom icon if needed
const AiGeneratedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 12 2.5zm0 17a7.5 7.5 0 1 1 7.5-7.5 7.509 7.509 0 0 1-7.5 7.5z"/><path d="M12 7.25a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0V8a.75.75 0 0 0-.75-.75zM12 14.5a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/></svg>
);


interface AiWeaponSuggestionProps {
  onAddSuggestedWeapon: (weapon: Weapon) => void;
}

export function AiWeaponSuggestion({ onAddSuggestedWeapon }: AiWeaponSuggestionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestWeapon = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to a backend that runs the Genkit flow.
      // For now, we simulate the flow.
      // const socialMediaTrends = "current internet memes, viral challenges"; // This would be dynamic
      // const suggestion: SuggestTrendingWeaponOutput = await suggestTrendingWeapon({ socialMediaTrends });
      
      // Mocked response for scaffolding
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      const mockSuggestions: SuggestTrendingWeaponOutput[] = [
        { weaponName: "Meme Hammer", weaponDescription: "Whack Anil with the power of internet trends!" },
        { weaponName: "Viral Popgun", weaponDescription: "Shoots concentrated virality. Mildly confusing." },
        { weaponName: "Challenge Gauntlet", weaponDescription: "Embodies the spirit of the latest online challenge." },
      ];
      const suggestion = mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)];


      const newWeapon: Weapon = {
        id: `ai-${suggestion.weaponName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: suggestion.weaponName,
        icon: AiGeneratedIcon, // Replace with a real icon or a way to generate/select one
        description: suggestion.weaponDescription,
        damage: Math.floor(Math.random() * 30) + 5, // Random damage
      };
      
      // This function is a prop, it would typically add to a dynamic list of weapons
      // For this scaffold, we'll just toast it as if it were added.
      // onAddSuggestedWeapon(newWeapon); 

      toast({
        title: "AI Weapon Suggested!",
        description: `${newWeapon.name}: ${newWeapon.description}`,
      });

    } catch (error) {
      console.error("Error suggesting weapon:", error);
      toast({
        title: "Error",
        description: "Could not suggest a weapon at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-accent flex items-center">
          <Wand2 className="mr-2 h-6 w-6" />
          AI Weapon Idea
        </CardTitle>
        <CardDescription>Let AI suggest a new trending weapon!</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSuggestWeapon} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? 'Thinking...' : 'Suggest New Weapon'}
        </Button>
      </CardContent>
    </Card>
  );
}
