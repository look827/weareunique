import { Header } from '@/components/layout/header';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { LeaveRequestsTable } from '@/components/dashboard/leave-requests-table';
import { InsightGenerator } from '@/components/dashboard/insight-generator';
import { getLeaveRequests } from '@/lib/mock-data';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Tranquil Escapes',
};

export default async function DashboardPage() {
  const user = await getUser();
  if (user?.role !== 'admin') {
    redirect('/my-requests');
  }

  const leaveRequests = await getLeaveRequests();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <WelcomeBanner name={user?.name || 'Admin'} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-5">
            <LeaveRequestsTable data={leaveRequests} isAdmin={true} />
          </div>
          <div className="lg:col-span-2">
            <InsightGenerator />
          </div>
        </div>
      </main>
    </div>
  );
}
