import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CapaLayout } from '@/components/capa-layout';
import { capaFetch } from '@/lib/capa-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function CapaListPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['capa', 'list'],
    queryFn: () => capaFetch<{ items: Record<string, unknown>[] }>('/'),
  });

  return (
    <CapaLayout>
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">CAPA Records</h1>
        <Button asChild><Link href="/capa/new">New CAPA</Link></Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item) => (
            <div key={String(item.id)} className="flex justify-between rounded border p-3">
              <div>
                <div className="font-medium">{String(item.capaNumber ?? item.title ?? '')}</div>
                <div className="text-xs text-muted-foreground">
                  {String(item.capaType ?? '')} · {String(item.status ?? '')}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/capa/${String(item.id)}`}>View</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </CapaLayout>
  );
}
