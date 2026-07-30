import { useState } from 'react';
import { useLocation } from 'wouter';
import { RiskLayout } from '@/components/risk-layout';
import { riskFetch } from '@/lib/risk-api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function NewRiskAssessmentPage() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const created = await riskFetch<{ id: string }>('/', {
        method: 'POST',
        body: JSON.stringify({ title, assessmentType: 'workplace' }),
      });
      navigate(`/risk-assessments/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">New Risk Assessment</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="max-w-lg space-y-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
    </RiskLayout>
  );
}
