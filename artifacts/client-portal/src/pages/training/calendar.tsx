import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function CalendarPage() {
  const { data } = useQuery({
    queryKey: ['learning', 'sessions'],
    queryFn: () =>
      learningFetch<{ items: { title: string; startsAt: string }[] }>('/sessions?upcoming=true'),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Training Calendar</h1>
      <Card>
        <CardHeader><CardTitle>Upcoming sessions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.items.map((s, i) => (
            <div key={i} className="rounded-md border p-3 text-sm">
              {s.title} — {new Date(s.startsAt).toLocaleString()}
            </div>
          ))}
        </CardContent>
      </Card>
    </TrainingLayout>
  );
}
