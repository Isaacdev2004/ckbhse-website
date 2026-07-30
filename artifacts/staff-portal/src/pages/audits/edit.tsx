import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface AuditEditPageProps {
  auditId: string;
}

export default function AuditEditPage({ auditId }: AuditEditPageProps) {
  const { data, refetch } = useQuery({
    queryKey: ['audits', auditId],
    queryFn: () => auditFetch<{ audit: Record<string, unknown> }>(`/${auditId}`),
  });
  const audit = data?.audit;
  const [name, setName] = useState('');
  const [site, setSite] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (audit) {
      setName(String(audit.name ?? ''));
      setSite(String(audit.site ?? ''));
    }
  }, [audit]);

  async function handleSave() {
    setError(null);
    try {
      await auditFetch(`/${auditId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, site }),
      });
      await refetch();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Edit Audit</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Planning</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site" />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={() => void handleSave()}>Save</Button>
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
