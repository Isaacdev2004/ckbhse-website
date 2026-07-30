import { useState } from 'react';
import { useLocation } from 'wouter';
import { CapaLayout } from '@/components/capa-layout';
import { capaFetch } from '@/lib/capa-api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function NewCapaPage() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState('');
  const [capaType, setCapaType] = useState('corrective');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const created = await capaFetch<{ id: string }>('/', {
        method: 'POST',
        body: JSON.stringify({ title, capaType }),
      });
      navigate(`/capa/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <CapaLayout>
      <h1 className="text-2xl font-semibold">New CAPA</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="max-w-lg space-y-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={capaType}
              onChange={(e) => setCapaType(e.target.value)}
            >
              <option value="corrective">Corrective</option>
              <option value="preventive">Preventive</option>
            </select>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
    </CapaLayout>
  );
}
