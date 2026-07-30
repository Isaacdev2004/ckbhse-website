import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent } from '@workspace/ui/components/card';

export default function AssessmentsPage() {
  const { data } = useQuery({
    queryKey: ['learning', 'assessments'],
    queryFn: () =>
      learningFetch<{ items: { title: string; courseSlug: string }[] }>('/assessments'),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Assessments</h1>
      <Card>
        <CardContent className="space-y-2 pt-6">
          {data?.items.map((a, i) => (
            <div key={i} className="rounded-md border p-3 text-sm">{a.title}</div>
          ))}
        </CardContent>
      </Card>
    </TrainingLayout>
  );
}
