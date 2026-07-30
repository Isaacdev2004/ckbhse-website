import { useAuth } from '@/providers/auth-provider';
import { PortalLayout } from '@/components/portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function ProfilePage() {
  const { session } = useAuth();

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account and session details</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Current session</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground">User ID</div>
              <div>{session?.userId ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Organisation</div>
              <div>{session?.organizationId ?? '—'}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-muted-foreground">Roles</div>
              <div>{session?.roles.join(', ') ?? '—'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
