import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminDashboard } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useAdminDashboard();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Cross-tenant counts and operational signals
          </p>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load dashboard'}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))
            : [
                { label: 'Organizations', value: data?.organizationCount ?? 0 },
                { label: 'Users', value: data?.userCount ?? 0 },
                { label: 'Active users', value: data?.activeUserCount ?? 0 },
                { label: 'Audit events (24h)', value: data?.auditLogCount24h ?? 0 },
                { label: 'Open outbox jobs', value: data?.openOutboxJobs ?? 0 },
              ].map((metric) => (
                <Card key={metric.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-bold">{metric.value}</CardContent>
                </Card>
              ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/audit-log">View audit log</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/system">System health</Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
