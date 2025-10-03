'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { updateGoalStatusAction } from '@/lib/actions';
import { toast } from '@/hooks/use-toast';
import { Target } from 'lucide-react';

type Goal = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  deadline: string;
  status: 'in_progress' | 'completed';
  createdAt: string;
};


type MyGoalsProps = {
  data: Goal[];
};

export function MyGoals({ data }: MyGoalsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (goalId: string, checked: boolean) => {
    startTransition(async () => {
      const newStatus = checked ? 'completed' : 'in_progress';
      try {
        await updateGoalStatusAction(goalId, newStatus);
        toast({
          title: 'Success!',
          description: `Goal marked as ${newStatus.replace('_', ' ')}.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update goal status.',
        });
      }
    });
  };

  const sortedGoals = [...data].sort((a, b) => {
    if (a.status === b.status) {
      return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
    }
    return a.status === 'in_progress' ? -1 : 1;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Goals</CardTitle>
        <CardDescription>Your personal and performance goals assigned by your manager.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 gap-4">
            <Target className="h-12 w-12" />
            <p>You don't have any goals assigned yet.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {sortedGoals.map((goal) => (
              <AccordionItem value={goal.id} key={goal.id}>
                 <div className="flex items-center w-full py-4">
                    <Checkbox
                        id={`goal-${goal.id}`}
                        checked={goal.status === 'completed'}
                        onCheckedChange={(checked) => handleStatusChange(goal.id, !!checked)}
                        disabled={isPending}
                        aria-label={`Mark goal "${goal.title}" as complete`}
                        className="mr-4"
                    />
                    <AccordionTrigger className="flex-1 text-left p-0">
                        <div className="flex-1 text-left">
                            <p className={`font-medium ${goal.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {goal.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Due: {format(parseISO(goal.deadline), 'MMM d, yyyy')}
                            </p>
                        </div>
                        <Badge variant={goal.status === 'completed' ? 'secondary' : 'default'} className="capitalize ml-4">
                            {goal.status.replace('_', ' ')}
                        </Badge>
                    </AccordionTrigger>
                </div>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground pl-12">
                  <p>{goal.description}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
