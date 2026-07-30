import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function HistoryPage() {
  const { data } = useQuery({
    queryKey: ['learning', 'cpd'],
    queryFn: () =>
      learningFetch<{ records: { category: string; hours: number; earnedAt: string }[] }>(
        '/cpd',
      ),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Learning History</h1>
      <Card>
        <CardHeader><CardTitle>CPD records</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.records.map((r, i) => (
            <div key={i} className="rounded-md border p-3 text-sm">
              {r.category}: {r.hours}h — {new Date(r.earnedAt).toLocaleDateString()}
            </div>
          ))}
        </CardContent>
      </Card>
    </TrainingLayout>
  );
}
