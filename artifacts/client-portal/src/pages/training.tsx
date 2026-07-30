import { useQuery } from '@tanstack/react-query';
import { PortalLayout } from '@/components/portal-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function TrainingPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'training'],
    queryFn: () =>
      portalFetch<{ certificates: Record<string, unknown>[] }>('/training'),
  });

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Training</h1>
          <p className="text-sm text-muted-foreground">
            Assigned courses, progress, and learning history
          </p>
        </div>
        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message}
          </div>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Training certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data?.certificates.map((cert) => (
              <div key={String(cert.id)} className="rounded-md border p-3">
                {String(cert.name)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
