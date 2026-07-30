import { useQuery } from '@tanstack/react-query';
import { LearnLayout } from '@/components/learn-layout';
import { learnFetch } from '@/lib/learn-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function CertificatesPage() {
  const { data } = useQuery({
    queryKey: ['learn', 'certificates'],
    queryFn: () =>
      learnFetch<{ items: { certificateNumber: string; courseSlug: string }[] }>(
        '/certificates',
      ),
  });

  return (
    <LearnLayout>
      <Card>
        <CardHeader><CardTitle>Certificates</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.items.map((c) => (
            <div key={c.certificateNumber} className="rounded-md border p-3 text-sm">
              {c.certificateNumber} — {c.courseSlug}
            </div>
          )) ?? null}
        </CardContent>
      </Card>
    </LearnLayout>
  );
}
