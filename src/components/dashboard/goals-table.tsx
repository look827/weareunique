'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { Target, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteGoalAction } from '@/lib/actions';
import { toast } from '@/hooks/use-toast';

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


type GoalsTableProps = {
  data: Goal[];
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('');
}

const statusConfig: Record<Goal['status'], { label: string; color: string }> = {
  in_progress: { label: 'In Progress', color: 'bg-yellow-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
};

function StatusBadge({ status }: { status: Goal['status'] }) {
  const { label, color } = statusConfig[status];
  return (
    <Badge className={`capitalize text-white ${color}`}>
      {label}
    </Badge>
  );
}

function DeleteGoalConfirmation({ goalId, onDeleted }: { goalId: string, onDeleted: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = React.useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteGoalAction(goalId);
            if (result.success) {
                toast({ title: 'Success', description: 'Goal deleted successfully.' });
                onDeleted();
                setIsOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the goal.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function GoalsTable({ data }: GoalsTableProps) {
    const [goals, setGoals] = React.useState(data);

    React.useEffect(() => {
        setGoals(data);
    }, [data]);

    const handleGoalDeleted = (goalId: string) => {
        setGoals(currentGoals => currentGoals.filter(g => g.id !== goalId));
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Employee Goals</CardTitle>
        <CardDescription>An overview of all goals assigned to employees.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Goal Title</TableHead>
                <TableHead className="hidden md:table-cell">Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                        <Target className="h-10 w-10" />
                        <p className="font-medium">No goals found.</p>
                        <p className="text-sm">Create a new goal to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                goals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(goal.userName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{goal.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground hidden lg:block max-w-xs truncate">{goal.description}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(parseISO(goal.deadline), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={goal.status} />
                    </TableCell>
                    <TableCell className="text-right">
                        <DeleteGoalConfirmation goalId={goal.id} onDeleted={() => handleGoalDeleted(goal.id)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
