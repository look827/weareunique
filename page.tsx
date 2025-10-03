import { LoginFormWrapper } from '@/components/auth/login-form-wrapper';
import { Box } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <Box className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Unicube</h1>
        </div>
        <p className="text-muted-foreground">Welcome to Tranquil Escapes</p>
      </div>
      <div className="mt-8 w-full max-w-sm">
        <LoginFormWrapper />
      </div>
    </main>
  );
}
