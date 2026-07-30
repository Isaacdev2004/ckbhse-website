import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { PortalLayout } from '@/components/portal-layout';
import { portalFetch } from '@/lib/portal-api';

interface ListProps {
  title: string;
  description: string;
  path: string;
  renderItem: (item: Record<string, unknown>) => React.ReactNode;
}

export function PortalListPage({
  title,
  description,
  path,
  renderItem,
}: ListProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['portal', path],
    queryFn: () =>
      portalFetch<{ items: Record<string, unknown>[] }>(path),
  });

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load data'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              data?.items.map((item, index) => (
                <div key={String(item.id ?? index)} className="rounded-md border p-3">
                  {renderItem(item)}
                </div>
              ))
            )}
            {!isLoading && data?.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No records yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
