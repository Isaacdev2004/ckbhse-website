import { useLocation } from 'wouter';
import { ReportingLayout } from '@/components/reporting-layout';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  getReportingListReportsQueryKey,
  useReportingCreateReport,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReportingReportsNewPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createReport = useReportingCreateReport();
  const [reportKey, setReportKey] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('compliance');

  return (
    <ReportingLayout>
      <h2 className="text-xl font-semibold">Create Report</h2>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Report definition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportKey">Report key</Label>
            <Input
              id="reportKey"
              value={reportKey}
              onChange={(event) => setReportKey(event.target.value)}
              placeholder="monthly-compliance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Monthly Compliance Report"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
          <Button
            disabled={createReport.isPending}
            onClick={() =>
              void createReport
                .mutateAsync({
                  data: {
                    reportKey,
                    title,
                    domain,
                    definition: {
                      sourceType: 'kpi',
                      filters: { domain },
                      columns: ['label', 'value', 'unit', 'trendDelta'],
                    },
                  },
                })
                .then(() => {
                  void queryClient.invalidateQueries({
                    queryKey: getReportingListReportsQueryKey(),
                  });
                  void navigate('/reporting/reports');
                })
            }
          >
            Save report
          </Button>
        </CardContent>
      </Card>
    </ReportingLayout>
  );
}
