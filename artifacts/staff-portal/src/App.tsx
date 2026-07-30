import { Route, Switch, Router as WouterRouter, useRoute } from 'wouter';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TooltipProvider } from '@workspace/ui/components/tooltip';

import { AuthProvider } from '@/providers/auth-provider';

import { ProtectedRoute } from '@/components/protected-route';

import DashboardPage from '@/pages/dashboard';

import LeadsPage from '@/pages/leads-list';

import LeadDetailPage from '@/pages/lead-detail';

import LoginPage from '@/pages/login';

import ForbiddenPage from '@/pages/forbidden';

import UnauthorizedPage from '@/pages/unauthorized';

import { PermissionRoute } from '@/components/permission-route';

import { PERMISSIONS } from '@workspace/platform/permissions';

import AuditDashboardPage from '@/pages/audits/dashboard';

import AuditsListPage from '@/pages/audits/index';

import AuditCalendarPage from '@/pages/audits/calendar';

import AuditTemplatesPage from '@/pages/audits/templates';

import NewAuditPage from '@/pages/audits/new';

import AuditDetailPage from '@/pages/audits/detail';

import AuditEditPage from '@/pages/audits/edit';

import AuditChecklistPage from '@/pages/audits/checklist';

import AuditFindingsPage from '@/pages/audits/findings';

import AuditEvidencePage from '@/pages/audits/evidence';

import AuditReportPage from '@/pages/audits/report';

import AuditHistoryPage from '@/pages/audits/history';

import InspectionDashboardPage from '@/pages/inspections/dashboard';
import InspectionsListPage from '@/pages/inspections/index';
import NewInspectionPage from '@/pages/inspections/new';
import InspectionDetailPage from '@/pages/inspections/detail';
import InspectionCalendarPage, {
  InspectionChecklistPage,
  InspectionFindingsPage,
  InspectionEvidencePage,
} from '@/pages/inspections/subpages';
import ComplianceWorkspacePage from '@/pages/compliance/workspace';
import ComplianceAnalyticsExecutivePage from '@/pages/compliance/analytics/executive';
import ComplianceAnalyticsRegulatoryPage from '@/pages/compliance/analytics/regulatory';
import ComplianceAnalyticsPerformancePage from '@/pages/compliance/analytics/performance';
import ComplianceAnalyticsExportsPage from '@/pages/compliance/analytics/exports';
import CapaDashboardPage from '@/pages/capa/dashboard';
import CapaListPage from '@/pages/capa/index';
import NewCapaPage from '@/pages/capa/new';
import CapaDetailPage from '@/pages/capa/detail';
import { CapaRcaPage } from '@/pages/capa/subpages';
import RiskDashboardPage from '@/pages/risk-assessments/dashboard';
import RiskAssessmentsListPage from '@/pages/risk-assessments/index';
import NewRiskAssessmentPage from '@/pages/risk-assessments/new';
import RiskAssessmentDetailPage from '@/pages/risk-assessments/detail';
import { HazardRegisterPage, RiskHeatMapPage, BowtiePage } from '@/pages/risk-assessments/subpages';
import ReportingExecutivePage from '@/pages/reporting/index';
import ReportingCompliancePage from '@/pages/reporting/compliance';
import ReportingAuditPage from '@/pages/reporting/audit';
import ReportingCrmPage from '@/pages/reporting/crm';
import ReportingLearningPage from '@/pages/reporting/learning';
import ReportingRiskPage from '@/pages/reporting/risk';
import ReportingReportsPage from '@/pages/reporting/reports/index';
import ReportingReportsNewPage from '@/pages/reporting/reports/new';
import ReportingReportDetailRoute from '@/pages/reporting/reports/detail';
import ReportingSchedulesPage from '@/pages/reporting/schedules/index';
import ReportingInsightsPage from '@/pages/reporting/insights/index';
import ReportingBenchmarksPage from '@/pages/reporting/benchmarks/index';
import ReportingBiPage from '@/pages/reporting/bi/index';



const queryClient = new QueryClient({

  defaultOptions: {

    queries: {

      staleTime: 30_000,

      retry: 1,

    },

  },

});



function LeadDetailRoute() {

  const [, params] = useRoute('/leads/:id');

  const leadId = params?.id;

  if (!leadId) {

    return null;

  }

  return <LeadDetailPage leadId={leadId} />;

}



function AuditIdRoute({ Page }: { Page: React.ComponentType<{ auditId: string }> }) {

  const [, params] = useRoute('/audits/:auditId/:rest?');

  const auditId = params?.auditId;

  if (!auditId) return null;

  return <Page auditId={auditId} />;

}



function InspectionIdRoute({ Page }: { Page: React.ComponentType<{ inspectionId: string }> }) {
  const [, params] = useRoute('/inspections/:inspectionId/:rest?');
  const inspectionId = params?.inspectionId;
  if (!inspectionId) return null;
  return <Page inspectionId={inspectionId} />;
}

function CapaIdRoute({ Page }: { Page: React.ComponentType<{ capaId: string }> }) {
  const [, params] = useRoute('/capa/:capaId/:rest?');
  const capaId = params?.capaId;
  if (!capaId) return null;
  return <Page capaId={capaId} />;
}

function RiskIdRoute({ Page }: { Page: React.ComponentType<{ assessmentId: string }> }) {
  const [, params] = useRoute('/risk-assessments/:assessmentId/:rest?');
  const assessmentId = params?.assessmentId;
  if (!assessmentId) return null;
  return <Page assessmentId={assessmentId} />;
}

function AppRoutes() {

  return (

    <Switch>

      <Route path="/login" component={LoginPage} />

      <Route path="/unauthorized" component={UnauthorizedPage} />

      <Route path="/forbidden" component={ForbiddenPage} />

      <Route path="/">

        <ProtectedRoute>

          <DashboardPage />

        </ProtectedRoute>

      </Route>

      <Route path="/leads">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.LEAD_READ}>

            <LeadsPage />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/leads/:id">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.LEAD_READ}>

            <LeadDetailRoute />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/dashboard">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditDashboardPage />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/calendar">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditCalendarPage />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/templates">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditTemplatesPage />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/new">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_CREATE}>

            <NewAuditPage />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/:auditId/edit">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_UPDATE}>

            <AuditIdRoute Page={AuditEditPage} />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/:auditId/checklist">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditIdRoute Page={AuditChecklistPage} />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/:auditId/findings">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditIdRoute Page={AuditFindingsPage} />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/:auditId/evidence">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditIdRoute Page={AuditEvidencePage} />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/:auditId/report">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditIdRoute Page={AuditReportPage} />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/:auditId/history">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditIdRoute Page={AuditHistoryPage} />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits/:auditId">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditIdRoute Page={AuditDetailPage} />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/audits">

        <ProtectedRoute>

          <PermissionRoute permission={PERMISSIONS.AUDIT_READ}>

            <AuditsListPage />

          </PermissionRoute>

        </ProtectedRoute>

      </Route>

      <Route path="/compliance/analytics/regulatory">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REGULATORY_READ}>
            <ComplianceAnalyticsRegulatoryPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/compliance/analytics/performance">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.COMPLIANCE_READ}>
            <ComplianceAnalyticsPerformancePage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/compliance/analytics/exports">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.COMPLIANCE_MANAGE}>
            <ComplianceAnalyticsExportsPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/compliance/analytics">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.COMPLIANCE_READ}>
            <ComplianceAnalyticsExecutivePage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/compliance">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.COMPLIANCE_READ}>
            <ComplianceWorkspacePage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections/dashboard">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_READ}>
            <InspectionDashboardPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections/calendar">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_READ}>
            <InspectionCalendarPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections/new">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_CREATE}>
            <NewInspectionPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections/:inspectionId/checklist">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_READ}>
            <InspectionIdRoute Page={InspectionChecklistPage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections/:inspectionId/findings">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_READ}>
            <InspectionIdRoute Page={InspectionFindingsPage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections/:inspectionId/evidence">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_READ}>
            <InspectionIdRoute Page={InspectionEvidencePage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections/:inspectionId">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_READ}>
            <InspectionIdRoute Page={InspectionDetailPage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/inspections">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.INSPECTION_READ}>
            <InspectionsListPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/capa/dashboard">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.CAPA_READ}>
            <CapaDashboardPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/capa/new">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.CAPA_CREATE}>
            <NewCapaPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/capa/:capaId/rca">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.CAPA_UPDATE}>
            <CapaIdRoute Page={CapaRcaPage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/capa/:capaId">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.CAPA_READ}>
            <CapaIdRoute Page={CapaDetailPage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/capa">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.CAPA_READ}>
            <CapaListPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/risk-assessments/dashboard">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.RISK_ASSESSMENT_READ}>
            <RiskDashboardPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/risk-assessments/hazards">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.RISK_ASSESSMENT_READ}>
            <HazardRegisterPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/risk-assessments/heatmap">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.RISK_ASSESSMENT_READ}>
            <RiskHeatMapPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/risk-assessments/new">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.RISK_ASSESSMENT_MANAGE}>
            <NewRiskAssessmentPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/risk-assessments/:assessmentId/bowtie">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.RISK_ASSESSMENT_READ}>
            <RiskIdRoute Page={BowtiePage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/risk-assessments/:assessmentId">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.RISK_ASSESSMENT_READ}>
            <RiskIdRoute Page={RiskAssessmentDetailPage} />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/risk-assessments">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.RISK_ASSESSMENT_READ}>
            <RiskAssessmentsListPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/reports/new">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_MANAGE}>
            <ReportingReportsNewPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/reports/:reportKey">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingReportDetailRoute />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/reports">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingReportsPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/schedules">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingSchedulesPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/insights">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingInsightsPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/benchmarks">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingBenchmarksPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/bi">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingBiPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/compliance">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingCompliancePage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/audit">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingAuditPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/crm">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingCrmPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/learning">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingLearningPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting/risk">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingRiskPage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/reporting">
        <ProtectedRoute>
          <PermissionRoute permission={PERMISSIONS.REPORT_READ}>
            <ReportingExecutivePage />
          </PermissionRoute>
        </ProtectedRoute>
      </Route>

    </Switch>

  );

}



function App() {

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



export default App;

