import { useQuery } from '@tanstack/react-query';
import { LearnLayout } from '@/components/learn-layout';
import { learnFetch } from '@/lib/learn-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function SessionsPage() {
  const { data } = useQuery({
    queryKey: ['learn', 'sessions'],
    queryFn: () =>
      learnFetch<{ items: { id: string; title: string; startsAt: string }[] }>(
        '/sessions',
      ),
  });

  return (
    <LearnLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Sessions</h1>
        <Card>
          <CardHeader><CardTitle>Scheduled sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data?.items.map((s) => (
              <div key={s.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{s.title}</div>
                <div className="text-muted-foreground">{new Date(s.startsAt).toLocaleString()}</div>
              </div>
            )) ?? null}
          </CardContent>
        </Card>
      </div>
    </LearnLayout>
  );
}
