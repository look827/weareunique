
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import type { Attendance } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

type MyAttendanceCalendarProps = {
  attendanceData: Attendance[];
};

type DayWithStatus = {
    day: Date;
    status: Attendance['status'] | 'weekend' | null;
};

function CalendarSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function MyAttendanceCalendar({ attendanceData }: MyAttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  if (!isClient) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Attendance</CardTitle>
                <CardDescription>A monthly overview of your attendance.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <CalendarSkeleton />
            </CardContent>
        </Card>
    );
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const daysWithStatus: DayWithStatus[] = daysInMonth.map(day => {
    const dayString = format(day, 'yyyy-MM-dd');
    const attendanceRecord = attendanceData.find(record => record.date === dayString);
    const dayOfWeek = day.getDay();
    let status: DayWithStatus['status'] = null;
    if (attendanceRecord) {
        status = attendanceRecord.status;
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
    }
    return { day, status };
  });

  const presentDays = attendanceData.filter(a => isSameMonth(parseISO(a.date), currentMonth) && a.status === 'present').length;
  const totalWorkingDays = daysWithStatus.filter(d => d.status !== 'weekend' && d.day <= new Date()).length;
  const attendancePercentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Attendance</CardTitle>
        <CardDescription>A monthly overview of your attendance.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <>
            <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Overall Attendance till {format(new Date(), 'dd-MM-yyyy')}</p>
                <p className="text-2xl font-bold">{presentDays}/{totalWorkingDays} ({attendancePercentage.toFixed(2)}%)</p>
            </div>
            <div className="flex items-center justify-between w-full mb-4 px-4">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
            <Calendar
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="p-0"
                classNames={{
                    day: "w-10 h-10 rounded-full",
                    day_selected: "",
                    day_today: "bg-transparent text-foreground font-normal rounded-full border border-primary",
                }}
                components={{
                    DayContent: ({ date }) => {
                        const dayString = format(date, 'yyyy-MM-dd');
                        const dayInfo = daysWithStatus.find(d => format(d.day, 'yyyy-MM-dd') === dayString);
                        const status = dayInfo?.status;

                        let statusClass = '';
                        switch (status) {
                            case 'present':
                                statusClass = 'bg-green-500 text-white';
                                break;
                            case 'absent':
                                statusClass = 'bg-red-500 text-white';
                                break;
                            case 'on_leave':
                                statusClass = 'bg-orange-500 text-white';
                                break;
                            default:
                                statusClass = 'text-foreground';
                        }
                        if (isSameDay(date, new Date()) && status) {
                        statusClass += ' ring-2 ring-primary';
                        }

                        return (
                            <div className={`flex items-center justify-center w-full h-full rounded-full ${statusClass}`}>
                            {format(date, 'd')}
                            </div>
                        );
                    },
                }}
                modifiersStyles={{
                    selected: { backgroundColor: 'transparent' },
                    today: { outline: 'none' },
                }}
                showOutsideDays={false}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 mt-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                    <span>On Leave</span>
                </div>
            </div>
        </>
      </CardContent>
    </Card>
  );
}
