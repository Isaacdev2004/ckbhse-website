import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function PathwaysPage() {
  const { data } = useQuery({
    queryKey: ['learning', 'pathways'],
    queryFn: () =>
      learningFetch<{ items: { title: string; description: string | null }[] }>(
        '/pathways',
      ),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Learning Pathways</h1>
      <div className="grid gap-4">
        {data?.items.map((p, i) => (
          <Card key={i}>
            <CardHeader><CardTitle>{p.title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{p.description}</CardContent>
          </Card>
        ))}
      </div>
    </TrainingLayout>
  );
}
