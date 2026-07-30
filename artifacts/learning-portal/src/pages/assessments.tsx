import { LearnLayout } from '@/components/learn-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function AssessmentsPage() {
  return (
    <LearnLayout>
      <Card>
        <CardHeader><CardTitle>Assessments &amp; Grading</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Review learner attempts, provide feedback, and manage assessment banks.
        </CardContent>
      </Card>
    </LearnLayout>
  );
}
