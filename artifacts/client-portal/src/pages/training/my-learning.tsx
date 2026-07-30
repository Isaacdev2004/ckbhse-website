import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function MyLearningPage() {
  const { data } = useQuery({
    queryKey: ['learning', 'enrolments'],
    queryFn: () =>
      learningFetch<{ items: { courseSlug: string; status: string }[] }>('/enrolments'),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">My Learning</h1>
      <Card>
        <CardHeader><CardTitle>Active enrolments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.items.map((e, i) => (
            <div key={`${e.courseSlug}-${i}`} className="rounded-md border p-3 text-sm">
              {e.courseSlug} — {e.status}
            </div>
          ))}
        </CardContent>
      </Card>
    </TrainingLayout>
  );
}
