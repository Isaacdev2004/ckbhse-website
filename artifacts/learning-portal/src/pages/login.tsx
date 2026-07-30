import { useState } from 'react';
import { Redirect } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useAuth } from '@/providers/auth-provider';

const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('consultant@ckbhse.co.uk');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isLoading && isAuthenticated) return <Redirect to="/dashboard" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <form
        className="w-full max-w-md space-y-4 rounded-xl border bg-card p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void login({ email, password, organizationId: PLATFORM_ORG_ID }).catch(
            (cause: Error) => setError(cause.message),
          );
        }}
      >
        <h1 className="text-2xl font-semibold">Trainer Workspace</h1>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
    </div>
  );
}
