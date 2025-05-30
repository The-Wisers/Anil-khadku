'use server';
/**
 * @fileOverview A trending weapon suggestion AI agent.
 *
 * - suggestTrendingWeapon - A function that suggests a trending weapon for the game.
 * - SuggestTrendingWeaponInput - The input type for the suggestTrendingWeapon function.
 * - SuggestTrendingWeaponOutput - The return type for the suggestTrendingWeapon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrendingWeaponInputSchema = z.object({
  socialMediaTrends: z
    .string()
    .describe('The current trending topics on social media.'),
});
export type SuggestTrendingWeaponInput = z.infer<
  typeof SuggestTrendingWeaponInputSchema
>;

const SuggestTrendingWeaponOutputSchema = z.object({
  weaponName: z.string().describe('The name of the suggested weapon.'),
  weaponDescription: z
    .string()
    .describe('A short description of the suggested weapon.'),
});
export type SuggestTrendingWeaponOutput = z.infer<
  typeof SuggestTrendingWeaponOutputSchema
>;

export async function suggestTrendingWeapon(
  input: SuggestTrendingWeaponInput
): Promise<SuggestTrendingWeaponOutput> {
  return suggestTrendingWeaponFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrendingWeaponPrompt',
  input: {schema: SuggestTrendingWeaponInputSchema},
  output: {schema: SuggestTrendingWeaponOutputSchema},
  prompt: `You are a creative game master who suggests new weapons for a "Kick the Buddy"-style game based on trending social media topics.

  Social Media Trends: {{{socialMediaTrends}}}

  Suggest a weapon that is relevant to the trending topics and would be fun to use in the game. Provide a short description of the weapon.
  Ensure the weapon name and description are appropriate for a comical, lighthearted game.`,
});

const suggestTrendingWeaponFlow = ai.defineFlow(
  {
    name: 'suggestTrendingWeaponFlow',
    inputSchema: SuggestTrendingWeaponInputSchema,
    outputSchema: SuggestTrendingWeaponOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
