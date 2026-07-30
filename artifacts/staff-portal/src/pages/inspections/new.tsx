import { useState } from 'react';
import { useLocation } from 'wouter';
import { InspectionLayout } from '@/components/inspection-layout';
import { inspectionFetch } from '@/lib/inspection-api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function NewInspectionPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const created = await inspectionFetch<{ id: string }>('/', {
        method: 'POST',
        body: JSON.stringify({ name, frequency: 'scheduled' }),
      });
      navigate(`/inspections/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <InspectionLayout>
      <h1 className="text-2xl font-semibold">New Inspection</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 max-w-lg">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Inspection name" required />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}
