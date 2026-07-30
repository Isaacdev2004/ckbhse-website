import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { InspectionLayout } from '@/components/inspection-layout';
import { inspectionFetch } from '@/lib/inspection-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function InspectionsListPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['inspections', 'list'],
    queryFn: () => inspectionFetch<{ items: Record<string, unknown>[] }>('/'),
  });

  return (
    <InspectionLayout>
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Inspections</h1>
        <Button asChild><Link href="/inspections/new">New</Link></Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item) => (
            <div key={String(item.id)} className="flex justify-between rounded border p-3">
              <div>
                <div className="font-medium">{String(item.name ?? '')}</div>
                <div className="text-xs text-muted-foreground">{String(item.status ?? '')}</div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/inspections/${String(item.id)}`}>View</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}
