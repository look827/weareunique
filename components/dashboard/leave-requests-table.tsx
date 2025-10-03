'use client';

import * as React from 'react';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { updateLeaveStatus } from '@/lib/actions';
import { useTransition } from 'react';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

type LeaveRequest = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};


type LeaveRequestsTableProps = {
  data: LeaveRequest[];
  isAdmin: boolean;
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('');
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500 hover:bg-yellow-500/90',
    icon: <Clock className="h-3 w-3" />,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-500 hover:bg-green-500/90',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500 hover:bg-red-500/90',
    icon: <XCircle className="h-3 w-3" />,
  },
};

function StatusBadge({ status }: { status: LeaveRequest['status'] }) {
  const { label, color, icon } = statusConfig[status];
  return (
    <Badge className={`capitalize text-white ${color}`}>
      {icon}
      <span className="ml-1">{label}</span>
    </Badge>
  );
}

function ActionButtons({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (status: 'approved' | 'rejected') => {
    startTransition(async () => {
      try {
        await updateLeaveStatus(requestId, status);
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

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
        onClick={() => handleAction('approved')}
        disabled={isPending}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        onClick={() => handleAction('rejected')}
        disabled={isPending}
      >
        Reject
      </Button>
    </div>
  );
}

export function LeaveRequestsTable({ data, isAdmin }: LeaveRequestsTableProps) {
  const title = isAdmin ? 'All Leave Requests' : 'My Leave Requests';
  const description = isAdmin
    ? 'Review and manage all leave requests from your team.'
    : 'A history of your past and pending leave requests.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="hidden md:table-cell">Reason</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.userAvatarUrl} alt={request.userName} />
                          <AvatarFallback>{getInitials(request.userName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{request.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(request.startDate), 'MMM d')} - {format(parseISO(request.endDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {request.status === 'pending' ? <ActionButtons requestId={request.id} /> : '-'}
                      </TableCell>
                    )}
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
