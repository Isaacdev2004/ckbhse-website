import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent } from '@workspace/ui/components/card';

export default function TrainingCertificatesPage() {
  const { data } = useQuery({
    queryKey: ['learning', 'certificates'],
    queryFn: () =>
      learningFetch<{ items: { certificateNumber: string; courseSlug: string }[] }>(
        '/certificates',
      ),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Certificates</h1>
      <Card>
        <CardContent className="space-y-2 pt-6">
          {data?.items.map((c) => (
            <div key={c.certificateNumber} className="rounded-md border p-3 text-sm">
              {c.certificateNumber} — {c.courseSlug}
            </div>
          ))}
        </CardContent>
      </Card>
    </TrainingLayout>
  );
}
