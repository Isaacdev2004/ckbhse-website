import { LearnLayout } from '@/components/learn-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function AttendancePage() {
  return (
    <LearnLayout>
      <Card>
        <CardHeader><CardTitle>Attendance</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Select a session to mark attendance. QR check-in and digital signature placeholders supported.
        </CardContent>
      </Card>
    </LearnLayout>
  );
}
