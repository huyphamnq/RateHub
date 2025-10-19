// Summarize review flow.
'use server';
/**
 * @fileOverview An AI agent that summarizes reviews and analyzes sentiment.
 *
 * - summarizeReview - A function that handles the review summarization and sentiment analysis process.
 * - SummarizeReviewInput - The input type for the summarizeReview function.
 * - SummarizeReviewOutput - The return type for the summarizeReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReviewInputSchema = z.object({
  reviewText: z.string().describe('The text content of the review to be summarized.'),
});
export type SummarizeReviewInput = z.infer<typeof SummarizeReviewInputSchema>;

const SummarizeReviewOutputSchema = z.object({
  summary: z.string().describe('A short summary of the review.'),
  sentiment: z.string().describe('The sentiment of the review (positive, negative, or neutral).'),
});
export type SummarizeReviewOutput = z.infer<typeof SummarizeReviewOutputSchema>;

export async function summarizeReview(input: SummarizeReviewInput): Promise<SummarizeReviewOutput> {
  return summarizeReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReviewPrompt',
  input: {schema: SummarizeReviewInputSchema},
  output: {schema: SummarizeReviewOutputSchema},
  prompt: `Summarize the following review and determine its sentiment (positive, negative, or neutral).

Review: {{{reviewText}}}

Summary:
Sentiment:`, 
});

const summarizeReviewFlow = ai.defineFlow(
  {
    name: 'summarizeReviewFlow',
    inputSchema: SummarizeReviewInputSchema,
    outputSchema: SummarizeReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
