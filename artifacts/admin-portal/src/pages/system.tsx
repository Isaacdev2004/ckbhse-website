import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminSystemHealth, useAdminSystemVersion } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function SystemPage() {
  const health = useAdminSystemHealth();
  const version = useAdminSystemVersion();

  const healthPayload = health.data as Record<string, unknown> | undefined;
  const versionPayload = version.data as Record<string, unknown> | undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">System</h1>
          <p className="text-sm text-muted-foreground">Health and build metadata</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {health.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : health.isError ? (
                <p className="text-destructive">
                  {(health.error as Error)?.message ?? 'Failed to load health'}
                </p>
              ) : (
                Object.entries(healthPayload ?? {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-border py-2">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-mono text-xs">{String(value)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Version</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {version.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : version.isError ? (
                <p className="text-destructive">
                  {(version.error as Error)?.message ?? 'Failed to load version'}
                </p>
              ) : (
                Object.entries(versionPayload ?? {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-border py-2">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-mono text-xs">{String(value)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
