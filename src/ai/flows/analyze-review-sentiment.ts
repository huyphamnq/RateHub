'use server';

/**
 * @fileOverview AI-powered review sentiment analysis flow.
 *
 * - analyzeReviewSentiment - Analyzes the sentiment of a given review text.
 * - AnalyzeReviewSentimentInput - The input type for the analyzeReviewSentiment function.
 * - AnalyzeReviewSentimentOutput - The return type for the analyzeReviewSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReviewSentimentInputSchema = z.object({
  reviewText: z
    .string()
    .describe('The text content of the review to analyze for sentiment.'),
});
export type AnalyzeReviewSentimentInput = z.infer<
  typeof AnalyzeReviewSentimentInputSchema
>;

const AnalyzeReviewSentimentOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The sentiment of the review (positive, negative, or neutral).' /* TODO: add more possible values */
    ),
  confidence: z
    .number()
    .describe(
      'A numerical value (0-1) representing the confidence level of the sentiment analysis.'
    ),
});
export type AnalyzeReviewSentimentOutput = z.infer<
  typeof AnalyzeReviewSentimentOutputSchema
>;

export async function analyzeReviewSentiment(
  input: AnalyzeReviewSentimentInput
): Promise<AnalyzeReviewSentimentOutput> {
  return analyzeReviewSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReviewSentimentPrompt',
  input: {schema: AnalyzeReviewSentimentInputSchema},
  output: {schema: AnalyzeReviewSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following review text. Determine if the sentiment is positive, negative, or neutral. Also, provide a confidence score (0-1) for your analysis.\n\nReview Text: {{{reviewText}}}\n\nRespond with the sentiment and confidence score. Output MUST be valid JSON. Use double quotes for keys and values. Follow the schema {sentiment: string, confidence: number}. Ensure that confidence is a number between 0 and 1, and that sentiment is one of "positive", "negative", or "neutral".\n`,
});

const analyzeReviewSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeReviewSentimentFlow',
    inputSchema: AnalyzeReviewSentimentInputSchema,
    outputSchema: AnalyzeReviewSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
