import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your account does not have the permissions required for this admin surface.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
