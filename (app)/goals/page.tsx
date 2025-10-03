import { Header } from '@/components/layout/header';
import { CreateGoal } from '@/components/dashboard/create-goal';
import { GoalsTable } from '@/components/dashboard/goals-table';
import { getAllGoals } from '@/lib/mock-data';
import { USERS } from '@/lib/data/users';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Manage Goals | Tranquil Escapes',
};

export default async function GoalsPage() {
  const user = await getUser();
  if (user?.role !== 'admin') {
    redirect('/my-requests');
  }

  const goals = await getAllGoals();
  const employees = USERS.filter(u => u.role === 'employee');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Manage Goals" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex justify-end">
            <CreateGoal employees={employees} />
        </div>
        <GoalsTable data={goals} />
      </main>
    </div>
  );
}
