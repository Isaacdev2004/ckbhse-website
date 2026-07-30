import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminListOrganizations } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function OrganizationsPage() {
  const { data, isLoading, isError, error } = useAdminListOrganizations();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground">All tenants on the platform</p>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load organizations'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              (data?.items ?? []).map((org) => (
                <div
                  key={org.id}
                  className="flex flex-col gap-1 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.slug}</p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{org.type}</span>
                    <span>{org.status}</span>
                    <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
