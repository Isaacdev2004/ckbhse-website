import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { LockKeyhole } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <LockKeyhole className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in required
          </h1>
          <p className="text-sm text-muted-foreground">
            Your session has expired or you are not signed in. Sign in to
            continue using the staff portal.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
