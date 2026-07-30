import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CapaLayout } from '@/components/capa-layout';
import { capaFetch } from '@/lib/capa-api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export function CapaRcaPage({ capaId }: { capaId: string }) {
  const queryClient = useQueryClient();
  const { data, isError, error } = useQuery({
    queryKey: ['capa', capaId, 'rca'],
    queryFn: () =>
      capaFetch<{ summary?: string; rootCauses?: string[] } | null>(`/${capaId}/rca`),
  });
  const [summary, setSummary] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.summary) setSummary(data.summary);
  }, [data?.summary]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    try {
      await capaFetch(`/${capaId}/rca`, {
        method: 'PUT',
        body: JSON.stringify({ summary, method: 'five_whys', rootCauses: [] }),
      });
      await queryClient.invalidateQueries({ queryKey: ['capa', capaId] });
    } catch (err) {
      setSaveError((err as Error).message);
    }
  }

  return (
    <CapaLayout>
      <h1 className="text-2xl font-semibold">Root Cause Analysis</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Analysis</CardTitle></CardHeader>
        <CardContent>
          {data?.summary ? (
            <p className="mb-4 text-sm text-muted-foreground">{data.summary}</p>
          ) : null}
          <form onSubmit={(e) => void handleSave(e)} className="max-w-lg space-y-4">
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summary"
            />
            {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
            <Button type="submit">Save RCA</Button>
          </form>
        </CardContent>
      </Card>
    </CapaLayout>
  );
}
