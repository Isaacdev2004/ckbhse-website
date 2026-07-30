import { useQuery } from '@tanstack/react-query';
import { LearnLayout } from '@/components/learn-layout';
import { learnFetch } from '@/lib/learn-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function DashboardPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['learn', 'dashboard'],
    queryFn: () =>
      learnFetch<{
        assignedCourses: { title: string; courseSlug: string }[];
        upcomingSessions: { title: string; startsAt: string }[];
        totalSessions: number;
      }>('/trainer/dashboard'),
  });

  return (
    <LearnLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Trainer Dashboard</h1>
        {isError ? (
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Assigned courses</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">
              {data?.assignedCourses.length ?? '—'}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Upcoming sessions</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">
              {data?.upcomingSessions.length ?? '—'}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total sessions</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">
              {data?.totalSessions ?? '—'}
            </CardContent>
          </Card>
        </div>
      </div>
    </LearnLayout>
  );
}
