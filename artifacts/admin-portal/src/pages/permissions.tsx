import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminListPermissions } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function PermissionsPage() {
  const { data, isLoading, isError, error } = useAdminListPermissions();

  const items = data?.items ?? [];
  const byDomain = items.reduce<Record<string, typeof items>>((acc, permission) => {
    const bucket = acc[permission.domain] ?? [];
    bucket.push(permission);
    acc[permission.domain] = bucket;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
          <p className="text-sm text-muted-foreground">RBAC permission matrix</p>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load permissions'}
          </div>
        ) : null}

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          Object.entries(byDomain).map(([domain, items]) => (
            <Card key={domain}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{domain}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {items.map((permission) => (
                  <div
                    key={permission.id}
                    className="rounded-md border border-border p-3 text-sm"
                  >
                    <p className="font-medium">{permission.name}</p>
                    <p className="text-xs text-muted-foreground">{permission.key}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
