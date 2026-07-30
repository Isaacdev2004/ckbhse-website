import { Link } from 'wouter';
import { ReportingLayout } from '@/components/reporting-layout';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  useReportingCreateExport,
  useReportingListExports,
  useReportingListReports,
  useReportingRunReport,
} from '@workspace/api-client-react';
import { useAuth } from '@/providers/auth-provider';
import { PERMISSIONS } from '@workspace/platform/permissions';

export default function ReportingReportsPage() {
  const { session } = useAuth();
  const { data: reports, isError, error } = useReportingListReports();
  const { data: exports } = useReportingListExports();
  const runReport = useReportingRunReport();
  const createExport = useReportingCreateExport();
  const canExport = session?.permissions.includes(PERMISSIONS.REPORT_EXPORT) === true;

  return (
    <ReportingLayout>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Saved Reports</h2>
          <p className="text-sm text-muted-foreground">
            Run, export, and manage custom report definitions
          </p>
        </div>
        <Link href="/reporting/reports/new">
          <Button>Create report</Button>
        </Link>
      </div>

      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(reports?.items ?? []).map((report) => (
          <Card key={report.reportKey}>
            <CardHeader>
              <CardTitle className="text-base">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {report.reportKey} · {report.domain}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={runReport.isPending}
                  onClick={() =>
                    void runReport.mutateAsync({ reportKey: report.reportKey })
                  }
                >
                  Run
                </Button>
                {canExport ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={createExport.isPending}
                      onClick={() =>
                        void createExport.mutateAsync({
                          reportKey: report.reportKey,
                          data: { format: 'csv' },
                        })
                      }
                    >
                      Export CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={createExport.isPending}
                      onClick={() =>
                        void createExport.mutateAsync({
                          reportKey: report.reportKey,
                          data: { format: 'pdf' },
                        })
                      }
                    >
                      Export PDF
                    </Button>
                  </>
                ) : null}
                <Link href={`/reporting/reports/${report.reportKey}`}>
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </Link>
              </div>
              {runReport.data && runReport.variables?.reportKey === report.reportKey ? (
                <pre className="max-h-40 overflow-auto rounded-md border bg-muted/40 p-2 text-xs">
                  {JSON.stringify(runReport.data.rows.slice(0, 5), null, 2)}
                </pre>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(exports?.items ?? []).map((job) => (
            <div key={job.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>
                {job.reportKey} · {job.format} · {job.status}
              </span>
              <span className="text-xs text-muted-foreground">{job.createdAt}</span>
            </div>
          ))}
          {(exports?.items ?? []).length === 0 ? (
            <p className="text-muted-foreground">No exports yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </ReportingLayout>
  );
}
