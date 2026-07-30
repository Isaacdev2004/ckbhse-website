import { Route, Switch, Router as WouterRouter, useRoute } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { AuthProvider } from '@/providers/auth-provider';
import { ProtectedRoute } from '@/components/protected-route';
import { PermissionRoute } from '@/components/permission-route';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import ProfilePage from '@/pages/profile';
import OrganisationPage from '@/pages/organisation';
import UsersPage from '@/pages/users';
import ProjectsPage from '@/pages/projects';
import CompliancePage from '@/pages/compliance';
import ComplianceAnalyticsPage from '@/pages/compliance-analytics';
import DocumentsPage from '@/pages/documents';
import TrainingPage from '@/pages/training';
import TrainingDashboardPage from '@/pages/training/dashboard';
import TrainingCataloguePage from '@/pages/training/catalogue';
import MyLearningPage from '@/pages/training/my-learning';
import PathwaysPage from '@/pages/training/pathways';
import CalendarPage from '@/pages/training/calendar';
import TrainingCertificatesPage from '@/pages/training/certificates';
import TranscriptPage from '@/pages/training/transcript';
import AssessmentsPage from '@/pages/training/assessments';
import HistoryPage from '@/pages/training/history';
import CertificatesPage from '@/pages/certificates';
import AuditsPage from '@/pages/audits/index';
import AuditDetailPage from '@/pages/audits/detail';
import AuditCalendarPage from '@/pages/audits/calendar';
import AuditHistoryPage from '@/pages/audits/history';
import AuditReportsPage from '@/pages/audits/reports';
import InspectionsPage from '@/pages/inspections/index';
import InspectionDetailPage from '@/pages/inspections/detail';
import InspectionCalendarPage from '@/pages/inspections/calendar';
import InspectionHistoryPage from '@/pages/inspections/history';
import CapaPage from '@/pages/capa/index';
import CapaDashboardPage from '@/pages/capa/dashboard';
import CapaDetailPage from '@/pages/capa/detail';
import RiskAssessmentsPage from '@/pages/risk-assessments/index';
import RiskDashboardPage from '@/pages/risk-assessments/dashboard';
import RiskHeatMapPage from '@/pages/risk-assessments/heatmap';
import RiskAssessmentDetailPage from '@/pages/risk-assessments/detail';
import IncidentsPage from '@/pages/incidents';
import ActionsPage from '@/pages/actions';
import MessagesPage from '@/pages/messages';
import SupportPage from '@/pages/support';
import SettingsPage from '@/pages/settings';
import ActivityPage from '@/pages/activity';
import ForbiddenPage from '@/pages/forbidden';
import UnauthorizedPage from '@/pages/unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function withPortal(
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | null,
  Page: () => React.JSX.Element,
) {
  return (
    <ProtectedRoute>
      {permission === null ? (
        <Page />
      ) : (
        <PermissionRoute permission={permission}>
          <Page />
        </PermissionRoute>
      )}
    </ProtectedRoute>
  );
}

function AuditDetailRoute() {
  const [, params] = useRoute('/audits/:auditId');
  const auditId = params?.auditId;
  if (!auditId) return <></>;
  return <AuditDetailPage auditId={auditId} />;
}

function InspectionDetailRoute() {
  const [, params] = useRoute('/inspections/:inspectionId');
  const inspectionId = params?.inspectionId;
  if (!inspectionId) return <></>;
  return <InspectionDetailPage inspectionId={inspectionId} />;
}

function CapaDetailRoute() {
  const [, params] = useRoute('/capa/:capaId');
  const capaId = params?.capaId;
  if (!capaId) return <></>;
  return <CapaDetailPage capaId={capaId} />;
}

function RiskDetailRoute() {
  const [, params] = useRoute('/risk-assessments/:assessmentId');
  const assessmentId = params?.assessmentId;
  if (!assessmentId) return <></>;
  return <RiskAssessmentDetailPage assessmentId={assessmentId} />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      <Route path="/forbidden" component={ForbiddenPage} />
      <Route path="/">{withPortal(PERMISSIONS.PORTAL_ACCESS, DashboardPage)}</Route>
      <Route path="/dashboard">
        {withPortal(PERMISSIONS.PORTAL_ACCESS, DashboardPage)}
      </Route>
      <Route path="/profile">
        {withPortal(PERMISSIONS.PORTAL_ACCESS, ProfilePage)}
      </Route>
      <Route path="/organisation">
        {withPortal(PERMISSIONS.PORTAL_ACCESS, OrganisationPage)}
      </Route>
      <Route path="/users">
        {withPortal(PERMISSIONS.USER_READ, UsersPage)}
      </Route>
      <Route path="/projects">
        {withPortal(PERMISSIONS.PROJECT_READ, ProjectsPage)}
      </Route>
      <Route path="/compliance/analytics">
        {withPortal(PERMISSIONS.COMPLIANCE_READ, ComplianceAnalyticsPage)}
      </Route>
      <Route path="/compliance">
        {withPortal(PERMISSIONS.COMPLIANCE_READ, CompliancePage)}
      </Route>
      <Route path="/documents">
        {withPortal(PERMISSIONS.DOCUMENT_READ, DocumentsPage)}
      </Route>
      <Route path="/training">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, TrainingDashboardPage)}
      </Route>
      <Route path="/training/dashboard">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, TrainingDashboardPage)}
      </Route>
      <Route path="/training/catalogue">
        {withPortal(PERMISSIONS.COURSE_READ, TrainingCataloguePage)}
      </Route>
      <Route path="/training/my-learning">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, MyLearningPage)}
      </Route>
      <Route path="/training/pathways">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, PathwaysPage)}
      </Route>
      <Route path="/training/calendar">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, CalendarPage)}
      </Route>
      <Route path="/training/certificates">
        {withPortal(PERMISSIONS.CERTIFICATE_READ, TrainingCertificatesPage)}
      </Route>
      <Route path="/training/transcript">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, TranscriptPage)}
      </Route>
      <Route path="/training/assessments">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, AssessmentsPage)}
      </Route>
      <Route path="/training/history">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, HistoryPage)}
      </Route>
      <Route path="/training/legacy">
        {withPortal(PERMISSIONS.LEARNING_ACCESS, TrainingPage)}
      </Route>
      <Route path="/certificates">
        {withPortal(PERMISSIONS.CERTIFICATE_READ, CertificatesPage)}
      </Route>
      <Route path="/audits/calendar">
        {withPortal(PERMISSIONS.AUDIT_READ, AuditCalendarPage)}
      </Route>
      <Route path="/audits/history">
        {withPortal(PERMISSIONS.AUDIT_READ, AuditHistoryPage)}
      </Route>
      <Route path="/audits/reports">
        {withPortal(PERMISSIONS.AUDIT_READ, AuditReportsPage)}
      </Route>
      <Route path="/audits/:auditId">
        {withPortal(PERMISSIONS.AUDIT_READ, AuditDetailRoute)}
      </Route>
      <Route path="/audits">
        {withPortal(PERMISSIONS.AUDIT_READ, AuditsPage)}
      </Route>
      <Route path="/inspections/calendar">
        {withPortal(PERMISSIONS.INSPECTION_READ, InspectionCalendarPage)}
      </Route>
      <Route path="/inspections/history">
        {withPortal(PERMISSIONS.INSPECTION_READ, InspectionHistoryPage)}
      </Route>
      <Route path="/inspections/:inspectionId">
        {withPortal(PERMISSIONS.INSPECTION_READ, InspectionDetailRoute)}
      </Route>
      <Route path="/inspections">
        {withPortal(PERMISSIONS.INSPECTION_READ, InspectionsPage)}
      </Route>
      <Route path="/capa/dashboard">
        {withPortal(PERMISSIONS.CAPA_READ, CapaDashboardPage)}
      </Route>
      <Route path="/capa/:capaId">
        {withPortal(PERMISSIONS.CAPA_READ, CapaDetailRoute)}
      </Route>
      <Route path="/capa">
        {withPortal(PERMISSIONS.CAPA_READ, CapaPage)}
      </Route>
      <Route path="/risk-assessments/dashboard">
        {withPortal(PERMISSIONS.RISK_ASSESSMENT_READ, RiskDashboardPage)}
      </Route>
      <Route path="/risk-assessments/heatmap">
        {withPortal(PERMISSIONS.RISK_ASSESSMENT_READ, RiskHeatMapPage)}
      </Route>
      <Route path="/risk-assessments/:assessmentId">
        {withPortal(PERMISSIONS.RISK_ASSESSMENT_READ, RiskDetailRoute)}
      </Route>
      <Route path="/risk-assessments">
        {withPortal(PERMISSIONS.RISK_ASSESSMENT_READ, RiskAssessmentsPage)}
      </Route>
      <Route path="/incidents">
        {withPortal(PERMISSIONS.INCIDENT_READ, IncidentsPage)}
      </Route>
      <Route path="/actions">
        {withPortal(PERMISSIONS.PORTAL_ACCESS, ActionsPage)}
      </Route>
      <Route path="/messages">
        {withPortal(PERMISSIONS.PORTAL_ACCESS, MessagesPage)}
      </Route>
      <Route path="/support">
        {withPortal(PERMISSIONS.TICKET_MANAGE, SupportPage)}
      </Route>
      <Route path="/settings">
        {withPortal(PERMISSIONS.CLIENT_USER_MANAGE, SettingsPage)}
      </Route>
      <Route path="/activity">
        {withPortal(PERMISSIONS.PORTAL_ACCESS, ActivityPage)}
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
