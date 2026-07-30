import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { InspectionLayout } from '@/components/inspection-layout';
import { inspectionFetch } from '@/lib/inspection-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function InspectionDetailPage({ inspectionId }: { inspectionId: string }) {
  const { data, isError, error } = useQuery({
    queryKey: ['inspections', inspectionId],
    queryFn: () =>
      inspectionFetch<{ inspection: Record<string, unknown>; findings: unknown[] }>(
        `/${inspectionId}`,
      ),
  });
  const inspection = data?.inspection;

  return (
    <InspectionLayout>
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-semibold">{String(inspection?.name ?? 'Inspection')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link href={`/inspections/${inspectionId}/checklist`}>Checklist</Link></Button>
          <Button variant="outline" size="sm" asChild><Link href={`/inspections/${inspectionId}/findings`}>Findings</Link></Button>
          <Button variant="outline" size="sm" asChild><Link href={`/inspections/${inspectionId}/evidence`}>Evidence</Link></Button>
        </div>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div>Status: {String(inspection?.status ?? '—')}</div>
          <div>Score: {String(inspection?.score ?? '—')}</div>
          <div>Findings: {data?.findings?.length ?? 0}</div>
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}
