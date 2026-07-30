import { useQueryClient } from '@tanstack/react-query';
import { ComplianceAnalyticsLayout } from '@/components/compliance-analytics-layout';
import {
  getComplianceAnalyticsExportsQueryKey,
  useComplianceAnalyticsExports,
  useCreateComplianceAnalyticsExport,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function ComplianceAnalyticsExportsPage() {
  const queryClient = useQueryClient();
  const { data, isError, error } = useComplianceAnalyticsExports();

  const createExport = useCreateComplianceAnalyticsExport({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getComplianceAnalyticsExportsQueryKey(),
        });
      },
    },
  });

  const items = data?.items as { id: string; exportType: string; format: string; status: string }[] | undefined;

  return (
    <ComplianceAnalyticsLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">BI Export Jobs</h1>
        <Button
          disabled={createExport.isPending}
          onClick={() => createExport.mutate({ data: { exportType: 'compliance_kpi', format: 'json' } })}
        >
          New KPI Export
        </Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle>Export History</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(items ?? []).map((job) => (
            <div key={job.id} className="flex justify-between rounded-md border p-3">
              <span>{job.exportType}</span>
              <span className="text-muted-foreground">
                {job.format} · {job.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </ComplianceAnalyticsLayout>
  );
}
