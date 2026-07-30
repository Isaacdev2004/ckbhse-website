import { ReportingLayout } from '@/components/reporting-layout';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  useReportingListSchedules,
  useReportingRunDueSchedules,
} from '@workspace/api-client-react';
import { useAuth } from '@/providers/auth-provider';
import { PERMISSIONS } from '@workspace/platform/permissions';

export default function ReportingSchedulesPage() {
  const { session } = useAuth();
  const { data, isError, error } = useReportingListSchedules();
  const runDue = useReportingRunDueSchedules();
  const canManage = session?.permissions.includes(PERMISSIONS.REPORT_MANAGE) === true;

  return (
    <ReportingLayout>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Report Schedules</h2>
          <p className="text-sm text-muted-foreground">
            Automated PDF and CSV delivery for saved reports
          </p>
        </div>
        {canManage ? (
          <Button
            variant="outline"
            disabled={runDue.isPending}
            onClick={() => void runDue.mutateAsync()}
          >
            Run due schedules
          </Button>
        ) : null}
      </div>

      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}

      <div className="grid gap-4">
        {(data?.items ?? []).map((schedule) => (
          <Card key={schedule.scheduleKey}>
            <CardHeader>
              <CardTitle className="text-base">{schedule.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                {schedule.scheduleKey} · {schedule.reportKey} · {schedule.cadence} at{' '}
                {schedule.timeUtc} UTC · {schedule.format}
              </p>
              <p className="text-muted-foreground">
                Recipients: {(schedule.recipients ?? []).join(', ') || 'None'}
              </p>
              <p className="text-muted-foreground">
                Next run: {schedule.nextRunAt ?? 'Not scheduled'} · Enabled:{' '}
                {schedule.enabled ? 'Yes' : 'No'}
              </p>
            </CardContent>
          </Card>
        ))}
        {(data?.items ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedules configured.</p>
        ) : null}
      </div>
    </ReportingLayout>
  );
}
