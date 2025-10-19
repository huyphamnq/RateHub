'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { summarizeReview } from '@/ai/flows/summarize-review';
import { Wand2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type AiSummarizerProps = {
  reviewText: string;
};

export default function AiSummarizer({ reviewText }: AiSummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (reviewText.split(' ').length < 50) {
        setSummary("This review is already quite short!");
        return;
      }
      const result = await summarizeReview({ reviewText });
      setSummary(result.summary);
    } catch (e) {
      setError('Failed to generate summary. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {summary ? (
        <Alert>
          <Wand2 className="h-4 w-4" />
          <AlertTitle className="font-headline">AI Summary</AlertTitle>
          <AlertDescription>
            {summary}
          </AlertDescription>
        </Alert>
      ) : (
        <Button onClick={handleSummarize} disabled={isLoading} variant="outline" size="sm">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Summarize with AI
        </Button>
      )}
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  );
}
