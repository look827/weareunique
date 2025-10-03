
"use client";

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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { User, Attendance, LeaveRequest } from '@/lib/types';
import { updateAttendanceAction, updateLeaveStatus } from '@/lib/actions';
import { toast } from '@/hooks/use-toast';
import { Plane, XCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
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
import { Badge } from '../ui/badge';

type AttendanceTableProps = {
  employees: (User & { attendance: Attendance[], leaveRequests: LeaveRequest[] })[];
  selectedDate: string; // yyyy-MM-dd
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('');
}


function AttendanceControl({ userId, date, currentStatus, leaveRequest }: { userId: string, date: string, currentStatus: Attendance['status'], leaveRequest?: LeaveRequest }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = React.useState(currentStatus);

  React.useEffect(() => {
    setOptimisticStatus(currentStatus);
  }, [currentStatus, date]);

  const handleStatusChange = (newStatus: Attendance['status']) => {
    const previousStatus = optimisticStatus;
    setOptimisticStatus(newStatus);

    startTransition(async () => {
      try {
        const result = await updateAttendanceAction(userId, date, newStatus);
        if (result?.error) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: result.error,
            });
            setOptimisticStatus(previousStatus);
        } else {
            toast({
              title: 'Success',
              description: `Attendance updated to ${newStatus}.`,
            });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update attendance.',
        });
        setOptimisticStatus(previousStatus);
      }
    });
  }
  
  const handleLeaveAction = (status: 'approved' | 'rejected') => {
    if (!leaveRequest) return;
    startTransition(async () => {
      try {
        await updateLeaveStatus(leaveRequest.id, status);
        toast({
          title: 'Success',
          description: `Request has been ${status}.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update request status.',
        });
      }
    });
  };

  const handleCancelLeave = () => {
    if (!leaveRequest) return;
    startTransition(async () => {
        try {
            await updateLeaveStatus(leaveRequest.id, 'rejected');
            toast({
                title: 'Leave Cancelled',
                description: `The leave for ${leaveRequest.userName} has been cancelled.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to cancel leave request.',
            });
        }
    });
  };
  
  if (leaveRequest) {
    switch (leaveRequest.status) {
      case 'approved':
        return (
          <div className="flex items-center justify-end gap-2 text-orange-500 font-medium">
            <Plane className="h-4 w-4" />
            <span>On Leave</span>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" disabled={isPending}>
                        <XCircle className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Approved Leave?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel the approved leave for {leaveRequest.userName}. The employee will be marked as absent for this period unless updated. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelLeave} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                            {isPending ? 'Cancelling...' : 'Yes, Cancel Leave'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center justify-end gap-2">
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                <Clock className="h-3 w-3 mr-1"/> Pending Leave
            </Badge>
            <Button size="sm" variant="outline" className="h-7 border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => handleLeaveAction('approved')} disabled={isPending}>Approve</Button>
            <Button size="sm" variant="outline" className="h-7 border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => handleLeaveAction('rejected')} disabled={isPending}>Reject</Button>
          </div>
        );
      case 'rejected':
         return (
          <div className="flex items-center justify-end gap-2">
            <Badge variant="secondary" className="bg-red-500/20 text-red-700 border-red-500/30">
                <XCircle className="h-3 w-3 mr-1"/> Rejected Leave
            </Badge>
            <Button size="sm" variant="outline" className="h-7 border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => handleLeaveAction('approved')} disabled={isPending}>Approve</Button>
          </div>
        );
    }
  }


  return (
    <RadioGroup
      value={optimisticStatus}
      onValueChange={(value: Attendance['status']) => handleStatusChange(value)}
      className="flex justify-end gap-4"
      disabled={isPending}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="present" id={`present-${userId}`} />
        <Label htmlFor={`present-${userId}`}>Present</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="absent" id={`absent-${userId}`} />
        <Label htmlFor={`absent-${userId}`}>Absent</Label>
      </div>
    </RadioGroup>
  );
}


export function AttendanceTable({ employees, selectedDate }: AttendanceTableProps) {
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((user) => {
              const attendanceForDate = user.attendance.find(a => a.date === selectedDate);
              
              let leaveRequestForDate: LeaveRequest | undefined;
              leaveRequestForDate = user.leaveRequests.find(req => {
                  return selectedDate >= req.startDate && selectedDate <= req.endDate;
              });

              const status = attendanceForDate?.status || 'present';
              
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AttendanceControl userId={user.id} date={selectedDate} currentStatus={status} leaveRequest={leaveRequestForDate} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
