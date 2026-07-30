import { useState } from 'react';
import { useLocation } from 'wouter';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function NewAuditPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [site, setSite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await auditFetch<{ id: string }>('/', {
        method: 'POST',
        body: JSON.stringify({ name, site: site || undefined }),
      });
      navigate(`/audits/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Plan New Audit</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Audit Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 max-w-lg">
            <Input
              placeholder="Audit name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              placeholder="Site (optional)"
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create Audit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
