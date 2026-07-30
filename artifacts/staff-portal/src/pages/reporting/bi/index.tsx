import { ReportingLayout } from '@/components/reporting-layout';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  useReportingCreateBiExport,
  useReportingListBiConnections,
  useReportingListBiExports,
} from '@workspace/api-client-react';
import { useAuth } from '@/providers/auth-provider';
import { PERMISSIONS } from '@workspace/platform/permissions';

export default function ReportingBiPage() {
  const { session } = useAuth();
  const { data: connections, isError, error } = useReportingListBiConnections();
  const { data: exports } = useReportingListBiExports();
  const createExport = useReportingCreateBiExport();
  const canExport = session?.permissions.includes(PERMISSIONS.REPORT_EXPORT) === true;

  return (
    <ReportingLayout>
      <div>
        <h2 className="text-xl font-semibold">Power BI Integration</h2>
        <p className="text-sm text-muted-foreground">
          Dataset export API for executive dashboards and incremental refresh
        </p>
      </div>

      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}

      <div className="grid gap-4">
        {(connections?.items ?? []).map((connection) => (
          <Card key={connection.connectionKey}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">{connection.datasetName}</CardTitle>
              {canExport ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={createExport.isPending}
                  onClick={() =>
                    void createExport.mutateAsync({
                      connectionKey: connection.connectionKey,
                      data: { exportType: 'incremental' },
                    })
                  }
                >
                  Export dataset
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                {connection.connectionKey} · {connection.workspaceId} ·{' '}
                {connection.datasetKey}
              </p>
              <p className="text-muted-foreground">
                Last sync: {connection.lastSyncAt ?? 'Never'} · Enabled:{' '}
                {connection.enabled ? 'Yes' : 'No'}
              </p>
            </CardContent>
          </Card>
        ))}
        {(connections?.items ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No BI connections configured.</p>
        ) : null}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">Recent exports</h3>
        <div className="grid gap-3">
          {(exports?.items ?? []).map((job) => (
            <Card key={job.id}>
              <CardContent className="pt-6 text-sm">
                <p>
                  {job.connectionKey} · {job.exportType} · {job.status} · {job.rowCount} rows
                </p>
                <p className="text-muted-foreground">Created: {job.createdAt}</p>
              </CardContent>
            </Card>
          ))}
          {(exports?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No BI exports yet.</p>
          ) : null}
        </div>
      </div>
    </ReportingLayout>
  );
}
