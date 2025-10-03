'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Sparkles, AlertCircle, Bot } from 'lucide-react';
import { generateReportAction } from '@/lib/actions';
import { ScrollArea } from '../ui/scroll-area';

export function InsightGenerator() {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerate = () => {
    startTransition(async () => {
      setError(null);
      setReport(null);
      const result = await generateReportAction();
      if (result.report) {
        setReport(result.report);
      } else if (result.error) {
        setError(result.error);
      }
      setIsDialogOpen(true);
    });
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>AI Insight Tool</CardTitle>
          <CardDescription>
            Analyze leave trends and identify significant patterns with our AI-powered tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
                <Bot className="h-12 w-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Click the button to generate an insights report on leave requests. The AI will analyze trends, conflicts, and frequencies.</p>
          <Button onClick={handleGenerate} disabled={isPending}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isPending ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Insights Report</DialogTitle>
            <DialogDescription>
              Analysis of leave request data for Unicube.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                {isPending && <p>Generating report...</p>}
                {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                )}
                {report && <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted p-4 rounded-md font-body">{report}</pre>}
            </div>
          </ScrollArea>
           <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
