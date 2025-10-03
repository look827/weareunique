import { Header } from '@/components/layout/header';
import { LeaveRequestForm } from '@/components/forms/leave-request-form';

export const metadata = {
  title: 'Apply for Leave | Tranquil Escapes',
};

export default function ApplyLeavePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Apply for Leave" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="mx-auto w-full max-w-2xl">
          <LeaveRequestForm />
        </div>
      </main>
    </div>
  );
}
