import { useQuery } from '@tanstack/react-query';
import { CapaLayout } from '@/components/capa-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function CapaDetailPage({ capaId }: { capaId: string }) {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'capa', capaId],
    queryFn: () =>
      portalFetch<{
        record: {
          capaNumber: string;
          title: string;
          status: string;
          capaType: string;
          priority: string;
          description?: string;
        };
        rca: { summary?: string } | null;
      }>(`/capa/${capaId}`),
  });
  const record = data?.record;

  return (
    <CapaLayout>
      <h1 className="text-2xl font-semibold">{record?.capaNumber ?? 'CAPA'}</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">{record?.title ?? 'Details'}</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div>Status: {record?.status ?? '—'}</div>
          <div>Type: {record?.capaType ?? '—'}</div>
          <div>Priority: {record?.priority ?? '—'}</div>
          <div className="md:col-span-2">{record?.description ?? ''}</div>
        </CardContent>
      </Card>
      {data?.rca?.summary ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Root Cause Analysis</CardTitle></CardHeader>
          <CardContent className="text-sm">{data.rca.summary}</CardContent>
        </Card>
      ) : null}
    </CapaLayout>
  );
}
