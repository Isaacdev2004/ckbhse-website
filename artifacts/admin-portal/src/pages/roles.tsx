import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminListRoles } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function RolesPage() {
  const { data, isLoading, isError, error } = useAdminListRoles();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground">Platform role catalogue</p>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load roles'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              (data?.items ?? []).map((role) => (
                <div
                  key={role.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{role.name}</p>
                    <span className="text-xs text-muted-foreground">{role.key}</span>
                  </div>
                  {role.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
                  ) : null}
                  {role.isSystem ? (
                    <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-xs">
                      System role
                    </span>
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
