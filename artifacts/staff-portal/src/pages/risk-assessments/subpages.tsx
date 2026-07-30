import { useQuery } from '@tanstack/react-query';
import { RiskLayout } from '@/components/risk-layout';
import { riskFetch } from '@/lib/risk-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export function HazardRegisterPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['risk', 'hazards'],
    queryFn: () => riskFetch<{ items: Record<string, unknown>[] }>('/hazards'),
  });

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">Hazard Register</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item) => (
            <div key={String(item.id)} className="rounded border p-3">
              <div className="font-medium">{String(item.hazardNumber ?? item.title ?? '')}</div>
              <div className="text-xs text-muted-foreground">
                {String(item.category ?? '')} · {String(item.status ?? '')} · Residual: {String(item.residualRating ?? '—')}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </RiskLayout>
  );
}

export function RiskHeatMapPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['risk', 'heatmap'],
    queryFn: () =>
      riskFetch<{ cells: { likelihood: number; severity: number; count: number; rating: string }[] }>(
        '/heatmap',
      ),
  });

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">Risk Heat Map</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Residual Risk Distribution</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.cells ?? []).map((cell) => (
            <div key={`${cell.likelihood}-${cell.severity}`} className="rounded border p-3 text-sm">
              L{cell.likelihood} × S{cell.severity} — {cell.count} item(s) — {cell.rating}
            </div>
          ))}
        </CardContent>
      </Card>
    </RiskLayout>
  );
}

export function BowtiePage({ assessmentId }: { assessmentId: string }) {
  const { data, isError, error } = useQuery({
    queryKey: ['risk', assessmentId, 'bowtie'],
    queryFn: () =>
      riskFetch<{ items: { elementType: string; title: string; description?: string }[] }>(
        `/${assessmentId}/bowtie`,
      ),
  });

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">Bow-Tie Diagram</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item, index) => (
            <div key={index} className="rounded border p-3">
              <div className="text-xs uppercase text-muted-foreground">{item.elementType.replace('_', ' ')}</div>
              <div className="font-medium">{item.title}</div>
              {item.description ? <div className="text-sm text-muted-foreground">{item.description}</div> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </RiskLayout>
  );
}
