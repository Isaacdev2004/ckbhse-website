import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CapaLayout } from '@/components/capa-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function CapaPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'capa'],
    queryFn: () =>
      portalFetch<{ items: { id: string; capaNumber: string; title: string; status: string }[] }>(
        '/capa',
      ),
  });

  return (
    <CapaLayout>
      <h1 className="text-2xl font-semibold">Corrective &amp; Preventive Actions</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between rounded border p-3">
              <div>
                <div className="font-medium">{item.capaNumber}</div>
                <div className="text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.status}</div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/capa/${item.id}`}>View</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </CapaLayout>
  );
}
