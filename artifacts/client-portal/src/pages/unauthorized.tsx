import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Sign in required</h1>
        <p className="text-sm text-muted-foreground">
          Your session has expired. Sign in to continue.
        </p>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
