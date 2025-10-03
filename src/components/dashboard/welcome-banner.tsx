import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WelcomeBanner({ name }: { name: string }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary-foreground/90">
          {getGreeting()}, {name}!
        </CardTitle>
        <CardDescription className="text-primary-foreground/70">
          Here's what's happening with your team's leave requests today.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
