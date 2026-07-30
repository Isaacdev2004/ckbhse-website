import { useQuery } from '@tanstack/react-query';
import { PortalLayout } from '@/components/portal-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function SettingsPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'settings'],
    queryFn: () => portalFetch<Record<string, unknown>>('/settings'),
  });

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Organisation preferences, notifications, and security
          </p>
        </div>
        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message}
          </div>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground">Timezone</div>
              <div>{String(data?.timezone ?? 'Europe/London')}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Language</div>
              <div>{String(data?.language ?? 'en-GB')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
