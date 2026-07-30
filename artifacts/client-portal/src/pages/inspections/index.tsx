import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { InspectionLayout } from '@/components/inspection-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function InspectionsPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'inspections'],
    queryFn: () => portalFetch<{ items: { id: string; title: string; status: string }[] }>('/inspections'),
  });

  return (
    <InspectionLayout>
      <h1 className="text-2xl font-semibold">Inspections</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between rounded border p-3">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.status}</div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/inspections/${item.id}`}>View</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}
