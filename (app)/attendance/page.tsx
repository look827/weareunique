import { Header } from '@/components/layout/header';
import { AttendanceManager } from '@/components/dashboard/attendance-manager';
import { getAllUsersWithAttendance } from '@/lib/mock-data';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Manage Attendance | Tranquil Escapes',
};

export default async function AttendancePage() {
  const user = await getUser();
  if (user?.role !== 'admin') {
    redirect('/my-requests');
  }

  const usersWithAttendance = await getAllUsersWithAttendance();
  const employees = usersWithAttendance.filter(u => u.role === 'employee');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Manage Attendance" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <AttendanceManager employees={employees} />
      </main>
    </div>
  );
}
