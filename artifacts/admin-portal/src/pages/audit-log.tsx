import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminSearchAuditLogs } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function AuditLogPage() {
  const { data, isLoading, isError, error } = useAdminSearchAuditLogs({ limit: 100 });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="text-sm text-muted-foreground">
            Recent platform events (latest 100 entries)
          </p>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load audit log'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              (data?.items ?? []).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {entry.entity}.{entry.action}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.occurredAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.eventType} · {entry.severity} · request {entry.requestId.slice(0, 8)}…
                  </p>
                  {entry.organizationId ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Org {entry.organizationId.slice(0, 8)}…
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
