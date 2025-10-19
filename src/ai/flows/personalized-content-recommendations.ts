'use server';

/**
 * @fileOverview A personalized content recommendation AI agent.
 *
 * - personalizedContentRecommendations - A function that handles the personalized content recommendation process.
 * - PersonalizedContentRecommendationsInput - The input type for the personalizedContentRecommendations function.
 * - PersonalizedContentRecommendationsOutput - The return type for the personalizedContentRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedContentRecommendationsInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'A description of the users profile, which includes viewing/reading history and preferences.'
    ),
  contentType: z
    .enum(['movie', 'book', 'game'])
    .describe('The type of content to recommend.'),
});
export type PersonalizedContentRecommendationsInput = z.infer<
  typeof PersonalizedContentRecommendationsInputSchema
>;

const PersonalizedContentRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommended content titles.'),
});
export type PersonalizedContentRecommendationsOutput = z.infer<
  typeof PersonalizedContentRecommendationsOutputSchema
>;

export async function personalizedContentRecommendations(
  input: PersonalizedContentRecommendationsInput
): Promise<PersonalizedContentRecommendationsOutput> {
  return personalizedContentRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedContentRecommendationsPrompt',
  input: {schema: PersonalizedContentRecommendationsInputSchema},
  output: {schema: PersonalizedContentRecommendationsOutputSchema},
  prompt: `You are an expert recommendation system. You take a user profile and a content type, and return a list of recommendations.

User Profile: {{{userProfile}}}
Content Type: {{{contentType}}}

Recommendations:`,
});

const personalizedContentRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedContentRecommendationsFlow',
    inputSchema: PersonalizedContentRecommendationsInputSchema,
    outputSchema: PersonalizedContentRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
