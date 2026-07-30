import { Link } from 'wouter';
import { StaffLayout } from '@/components/staff-layout';
import {
  useComplianceDashboard,
  useComplianceWorkspace,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function ComplianceWorkspacePage() {
  const { data: workspace, isError, error } = useComplianceWorkspace();
  const { data: dashboard } = useComplianceDashboard();

  const workspaceData = workspace as {
    overallComplianceScore?: number;
    openAudits?: number;
    openInspections?: number;
    outstandingFindings?: number;
    legalObligations?: number;
    activeControls?: number;
  } | undefined;
  const dashboardWidgets = dashboard?.widgets as Record<string, number> | undefined;

  return (
    <StaffLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Compliance Workspace</h1>
        <Button asChild variant="outline">
          <Link href="/compliance/analytics">View analytics</Link>
        </Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Compliance %', workspaceData?.overallComplianceScore],
          ['Open Audits', workspaceData?.openAudits],
          ['Open Inspections', workspaceData?.openInspections],
          ['Outstanding Findings', workspaceData?.outstandingFindings],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Legal Obligations', workspaceData?.legalObligations],
          ['Active Controls', workspaceData?.activeControls],
          ['Training Completion', dashboardWidgets?.trainingCompletion],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
    </StaffLayout>
  );
}
