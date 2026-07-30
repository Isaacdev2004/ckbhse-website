import { useQuery } from '@tanstack/react-query';
import { LearnLayout } from '@/components/learn-layout';
import { learnFetch } from '@/lib/learn-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ['learn', 'analytics'],
    queryFn: () =>
      learnFetch<{
        totalEnrollments: number;
        completedCourses: number;
        completionRate: number;
        averageScore: number;
      }>('/analytics'),
  });

  return (
    <LearnLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Training Reports</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Completion rate</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{data?.completionRate ?? '—'}%</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Average score</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{data?.averageScore ?? '—'}%</CardContent>
          </Card>
        </div>
      </div>
    </LearnLayout>
  );
}
