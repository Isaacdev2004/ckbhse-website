import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this area of the client portal.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
