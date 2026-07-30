import { useRoute } from 'wouter';
import { ReportingLayout } from '@/components/reporting-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { useReportingGetReport, useReportingRunReport } from '@workspace/api-client-react';
import { Button } from '@workspace/ui/components/button';

function ReportDetailPage({ reportKey }: { reportKey: string }) {
  const { data, isError, error } = useReportingGetReport(reportKey);
  const runReport = useReportingRunReport();

  return (
    <ReportingLayout>
      <h2 className="text-xl font-semibold">{data?.title ?? reportKey}</h2>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Definition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
          <Button
            disabled={runReport.isPending}
            onClick={() => void runReport.mutateAsync({ reportKey })}
          >
            Run report
          </Button>
          {runReport.data ? (
            <pre className="max-h-80 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
              {JSON.stringify(runReport.data, null, 2)}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    </ReportingLayout>
  );
}

export default function ReportingReportDetailRoute() {
  const [, params] = useRoute('/reporting/reports/:reportKey');
  const reportKey = params?.reportKey;
  if (!reportKey || reportKey === 'new') return null;
  return <ReportDetailPage reportKey={reportKey} />;
}
