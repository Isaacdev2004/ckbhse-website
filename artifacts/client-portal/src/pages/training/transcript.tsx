import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function TranscriptPage() {
  const { data } = useQuery({
    queryKey: ['learning', 'transcript'],
    queryFn: () => learningFetch<Record<string, unknown>>('/transcript'),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Learning Transcript</h1>
      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="text-sm">
          CPD total: {String(data?.cpdTotalHours ?? '—')} hours
        </CardContent>
      </Card>
    </TrainingLayout>
  );
}
