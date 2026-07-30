import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { PortalLayout } from '@/components/portal-layout';
import { usePortalCompliance } from '@workspace/api-client-react';

export default function CompliancePage() {
  const { data, isError, error } = usePortalCompliance();

  const workspace = data?.workspace as {
    openAudits?: number;
    openInspections?: number;
    outstandingFindings?: number;
    legalObligations?: number;
    activeControls?: number;
    certifications?: { name: string; status: string }[];
  } | undefined;

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Compliance Workspace</h1>
            <p className="text-sm text-muted-foreground">
              Organisation compliance score, registers, and improvement plans
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/compliance/analytics">Analytics</Link>
          </Button>
        </div>
        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load data'}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Compliance Score', data?.complianceScore],
            ['Open Audits', workspace?.openAudits],
            ['Open Inspections', workspace?.openInspections],
            ['Outstanding Findings', workspace?.outstandingFindings],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Certifications & Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(workspace?.certifications ?? []).map((cert) => (
              <div key={cert.name} className="rounded-md border p-3 text-sm">
                {cert.name} · {cert.status}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Compliance Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {(data?.tasks ?? []).map((task) => (
              <div key={String((task as { id?: string }).id)} className="rounded-md border p-3">
                {String((task as { title?: string }).title)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
