
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { User, Attendance, LeaveRequest } from '@/lib/types';
import { AttendanceTable } from './attendance-table';
import { Skeleton } from '../ui/skeleton';

type AttendanceManagerProps = {
  employees: (User & { attendance: Attendance[], leaveRequests: LeaveRequest[] })[];
};

function AttendanceTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AttendanceManager({ employees }: AttendanceManagerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setSelectedDate(new Date());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Attendance</CardTitle>
        <CardDescription>Select a date to view and manage employee attendance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
            <p className="text-sm font-medium">Selected Date:</p>
            <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={'outline'}
                className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => setSelectedDate(d || new Date())}
                initialFocus
                />
            </PopoverContent>
            </Popover>
        </div>

        {isClient && selectedDate ? <AttendanceTable employees={employees} selectedDate={format(selectedDate, 'yyyy-MM-dd')} /> : <AttendanceTableSkeleton />}
      </CardContent>
    </Card>
  );
}
