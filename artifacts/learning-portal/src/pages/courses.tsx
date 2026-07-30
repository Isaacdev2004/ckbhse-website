import { useQuery } from '@tanstack/react-query';
import { LearnLayout } from '@/components/learn-layout';
import { learnFetch } from '@/lib/learn-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function CoursesPage() {
  const { data } = useQuery({
    queryKey: ['learn', 'courses'],
    queryFn: () =>
      learnFetch<{ assignedCourses: { title: string; courseSlug: string }[] }>(
        '/trainer/dashboard',
      ),
  });

  return (
    <LearnLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Assigned Courses</h1>
        <Card>
          <CardHeader><CardTitle>Courses</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data?.assignedCourses.map((c) => (
              <div key={c.courseSlug} className="rounded-md border p-3 text-sm">
                {c.title}
              </div>
            )) ?? <p className="text-muted-foreground">No assigned courses</p>}
          </CardContent>
        </Card>
      </div>
    </LearnLayout>
  );
}
