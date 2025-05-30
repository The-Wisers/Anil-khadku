
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestTrendingWeapon, type SuggestTrendingWeaponOutput } from '@/ai/flows/weapon-suggestion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AiWeaponSuggestionProps {
  onAddSuggestedWeapon: (weaponName: string, weaponDescription: string) => void;
}

export function AiWeaponSuggestion({ onAddSuggestedWeapon }: AiWeaponSuggestionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [socialMediaInput, setSocialMediaInput] = useState("cats, laser pointers, cardboard boxes");
  const { toast } = useToast();

  const handleSuggestWeapon = async () => {
    if (!socialMediaInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide some social media trends.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const suggestion: SuggestTrendingWeaponOutput = await suggestTrendingWeapon({ 
        socialMediaTrends: socialMediaInput 
      });
      
      if (suggestion && suggestion.weaponName && suggestion.weaponDescription) {
        onAddSuggestedWeapon(suggestion.weaponName, suggestion.weaponDescription);
        // Toast for adding is handled by the parent component (GamePage)
      } else {
        toast({
          title: "AI Suggestion Failed",
          description: "The AI couldn't come up with a weapon idea. Try different trends!",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error suggesting weapon:", error);
      let errorMessage = "Could not suggest a weapon at this time.";
      if (error instanceof Error) {
        errorMessage = error.message.includes(' responsabile') // From Genkit safety error
          ? "Suggestion blocked by safety filters. Try different, more appropriate trends."
          : "Could not suggest a weapon. Please try again.";
      }
      toast({
        title: "Error",
        description: errorMessage,
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
        <CardDescription>Let AI suggest a new weapon based on trends!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="social-media-trends" className="text-sm font-medium">
            Current Social Media Trends
          </Label>
          <Textarea
            id="social-media-trends"
            placeholder="e.g., dancing cats, new memes, viral challenges"
            value={socialMediaInput}
            onChange={(e) => setSocialMediaInput(e.target.value)}
            className="mt-1"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provide a few comma-separated keywords.
          </p>
        </div>
        <Button onClick={handleSuggestWeapon} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? 'Thinking...' : 'Suggest New Weapon'}
        </Button>
      </CardContent>
    </Card>
  );
}
