import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  getAdminListFeatureFlagsQueryKey,
  useAdminListFeatureFlags,
  useAdminUpdateFeatureFlag,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useAdminListFeatureFlags();
  const updateFlag = useAdminUpdateFeatureFlag({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAdminListFeatureFlagsQueryKey(),
        });
      },
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Feature flags</h1>
          <p className="text-sm text-muted-foreground">Global platform toggles</p>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load feature flags'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              (data?.items ?? []).map((flag) => (
                <div
                  key={flag.id}
                  className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{flag.key}</p>
                    {flag.description ? (
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateFlag.isPending}
                      onClick={() =>
                        void updateFlag.mutateAsync({
                          key: flag.key,
                          data: { enabled: !flag.enabled },
                        })
                      }
                    >
                      {flag.enabled ? 'Disable' : 'Enable'}
                    </Button>
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
