import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Access denied
          </h1>
          <p className="text-sm text-muted-foreground">
            You are signed in but do not have permission to view this page.
            Contact your organisation administrator if you believe this is an
            error.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Return to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
