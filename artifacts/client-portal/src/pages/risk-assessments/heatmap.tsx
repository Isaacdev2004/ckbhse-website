import { useQuery } from '@tanstack/react-query';
import { RiskLayout } from '@/components/risk-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function RiskHeatMapPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'risk-assessments', 'heatmap'],
    queryFn: () =>
      portalFetch<{ cells: { likelihood: number; severity: number; count: number; rating: string }[] }>(
        '/risk-assessments/heatmap',
      ),
  });

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">Risk Heat Map</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Residual Risk Cells</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {(data?.cells ?? []).map((cell) => (
            <div key={`${cell.likelihood}-${cell.severity}`} className="rounded border p-3 text-sm">
              L{cell.likelihood} × S{cell.severity}: {cell.count} ({cell.rating})
            </div>
          ))}
        </CardContent>
      </Card>
    </RiskLayout>
  );
}
