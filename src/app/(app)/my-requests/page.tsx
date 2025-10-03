import { Header } from '@/components/layout/header';
import { LeaveRequestsTable } from '@/components/dashboard/leave-requests-table';
import { getLeaveRequestsByUserId, getAttendanceForUser, getGoalsByUserId } from '@/lib/mock-data';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MyAttendanceCalendar } from '@/components/dashboard/my-attendance-calendar';
import { MyGoals } from '@/components/dashboard/my-goals';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'My Dashboard | Tranquil Escapes',
};

export default async function MyRequestsPage() {
  const user = await getUser();
  if (!user) {
    redirect('/');
  }

  const [leaveRequests, attendance, goals] = await Promise.all([
    getLeaveRequestsByUserId(user.id),
    getAttendanceForUser(user.id),
    getGoalsByUserId(user.id),
  ]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="My Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid grid-cols-1 gap-6">
            <MyAttendanceCalendar attendanceData={attendance} />
            <Separator />
            <MyGoals data={goals} />
            <Separator />
            <LeaveRequestsTable data={leaveRequests} isAdmin={false} />
        </div>
      </main>
    </div>
  );
}
