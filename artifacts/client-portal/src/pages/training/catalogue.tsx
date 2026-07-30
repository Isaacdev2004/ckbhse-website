import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function TrainingCataloguePage() {
  const { data } = useQuery({
    queryKey: ['learning', 'catalogue'],
    queryFn: () =>
      learningFetch<{ items: { title: string; slug: string; summary: string }[] }>(
        '/catalogue',
      ),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Course Catalogue</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {data?.items.slice(0, 12).map((item) => (
          <Card key={item.slug}>
            <CardHeader><CardTitle>{item.title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.summary}</CardContent>
          </Card>
        ))}
      </div>
    </TrainingLayout>
  );
}
