import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CapaLayout } from '@/components/capa-layout';
import { capaFetch } from '@/lib/capa-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function CapaDetailPage({ capaId }: { capaId: string }) {
  const { data, isError, error } = useQuery({
    queryKey: ['capa', capaId],
    queryFn: () =>
      capaFetch<{
        record: Record<string, unknown>;
        rca: Record<string, unknown> | null;
        verifications: unknown[];
        approvals: unknown[];
        escalations: unknown[];
      }>(`/${capaId}`),
  });
  const record = data?.record;

  return (
    <CapaLayout>
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {String(record?.capaNumber ?? record?.title ?? 'CAPA')}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/capa/${capaId}/rca`}>Root Cause Analysis</Link>
          </Button>
        </div>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div>Status: {String(record?.status ?? '—')}</div>
          <div>Type: {String(record?.capaType ?? '—')}</div>
          <div>Priority: {String(record?.priority ?? '—')}</div>
          <div>Due: {record?.dueDate ? String(record.dueDate) : '—'}</div>
          <div className="md:col-span-2">Description: {String(record?.description ?? '—')}</div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Verifications</CardTitle></CardHeader>
          <CardContent>{data?.verifications?.length ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Approvals</CardTitle></CardHeader>
          <CardContent>{data?.approvals?.length ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Escalations</CardTitle></CardHeader>
          <CardContent>{data?.escalations?.length ?? 0}</CardContent>
        </Card>
      </div>
    </CapaLayout>
  );
}
