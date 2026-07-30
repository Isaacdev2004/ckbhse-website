import { useQuery } from '@tanstack/react-query';
import { TrainingLayout } from '@/components/training-layout';
import { learningFetch } from '@/lib/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function TrainingDashboardPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['learning', 'dashboard'],
    queryFn: () =>
      learningFetch<{
        currentEnrollments?: number;
        completedCourses?: number;
        inProgressCourses?: number;
        cpdHoursEarned?: number;
      }>('/dashboard'),
  });

  return (
    <TrainingLayout>
      <h1 className="text-2xl font-semibold">Learning Dashboard</h1>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Current enrolments', data?.currentEnrollments],
          ['Completed', data?.completedCourses],
          ['In progress', data?.inProgressCourses],
          ['CPD hours', data?.cpdHoursEarned],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
    </TrainingLayout>
  );
}
