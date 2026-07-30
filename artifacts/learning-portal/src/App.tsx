import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { AuthProvider } from '@/providers/auth-provider';
import { ProtectedRoute } from '@/components/protected-route';
import { PermissionRoute } from '@/components/permission-route';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import CoursesPage from '@/pages/courses';
import SessionsPage from '@/pages/sessions';
import AttendancePage from '@/pages/attendance';
import AssessmentsPage from '@/pages/assessments';
import CertificatesPage from '@/pages/certificates';
import ReportsPage from '@/pages/reports';
import ForbiddenPage from '@/pages/forbidden';
import UnauthorizedPage from '@/pages/unauthorized';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function withLearn(
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS],
  Page: () => React.JSX.Element,
) {
  return (
    <ProtectedRoute>
      <PermissionRoute permission={permission}>
        <Page />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      <Route path="/forbidden" component={ForbiddenPage} />
      <Route path="/">{withLearn(PERMISSIONS.COURSE_READ, DashboardPage)}</Route>
      <Route path="/dashboard">
        {withLearn(PERMISSIONS.COURSE_READ, DashboardPage)}
      </Route>
      <Route path="/courses">
        {withLearn(PERMISSIONS.COURSE_READ, CoursesPage)}
      </Route>
      <Route path="/sessions">
        {withLearn(PERMISSIONS.COURSE_READ, SessionsPage)}
      </Route>
      <Route path="/attendance">
        {withLearn(PERMISSIONS.ASSESSMENT_MARK, AttendancePage)}
      </Route>
      <Route path="/assessments">
        {withLearn(PERMISSIONS.ASSESSMENT_MARK, AssessmentsPage)}
      </Route>
      <Route path="/certificates">
        {withLearn(PERMISSIONS.CERTIFICATE_READ, CertificatesPage)}
      </Route>
      <Route path="/reports">
        {withLearn(PERMISSIONS.ENROLMENT_MANAGE, ReportsPage)}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRoutes />
          </WouterRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
