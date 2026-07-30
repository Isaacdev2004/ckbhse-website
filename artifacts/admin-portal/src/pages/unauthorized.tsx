import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Sign in required</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You must authenticate before accessing the admin portal.
      </p>
      <Button asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    </div>
  );
}
