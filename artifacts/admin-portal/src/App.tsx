import { Route, Switch, Router as WouterRouter, useRoute } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { AuthProvider } from '@/providers/auth-provider';
import { ProtectedRoute } from '@/components/protected-route';
import { PermissionRoute } from '@/components/permission-route';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import OrganizationsPage from '@/pages/organizations';
import UsersPage from '@/pages/users';
import RolesPage from '@/pages/roles';
import PermissionsPage from '@/pages/permissions';
import AuditLogPage from '@/pages/audit-log';
import FeatureFlagsPage from '@/pages/feature-flags';
import SystemPage from '@/pages/system';
import CmsDashboardPage from '@/pages/cms/dashboard';
import CmsEntriesPage from '@/pages/cms/entries';
import CmsEntryDetailPage from '@/pages/cms/entry-detail';
import CmsMediaPage from '@/pages/cms/media';
import CmsSeoPage from '@/pages/cms/seo';
import CmsApprovalsPage from '@/pages/cms/approvals';
import ForbiddenPage from '@/pages/forbidden';
import UnauthorizedPage from '@/pages/unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function withAdmin(
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

function CmsEntryDetailRoute() {
  const [, params] = useRoute('/cms/entries/:entryId');
  const entryId = params?.entryId;
  if (!entryId) return <></>;
  return <CmsEntryDetailPage entryId={entryId} />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      <Route path="/forbidden" component={ForbiddenPage} />
      <Route path="/">{withAdmin(PERMISSIONS.ADMIN_ACCESS, DashboardPage)}</Route>
      <Route path="/dashboard">
        {withAdmin(PERMISSIONS.ADMIN_ACCESS, DashboardPage)}
      </Route>
      <Route path="/organizations">
        {withAdmin(PERMISSIONS.TENANT_VIEW_ALL, OrganizationsPage)}
      </Route>
      <Route path="/users">{withAdmin(PERMISSIONS.USER_READ, UsersPage)}</Route>
      <Route path="/roles">{withAdmin(PERMISSIONS.ROLE_READ, RolesPage)}</Route>
      <Route path="/permissions">
        {withAdmin(PERMISSIONS.PERMISSION_READ, PermissionsPage)}
      </Route>
      <Route path="/audit-log">
        {withAdmin(PERMISSIONS.AUDIT_LOG_READ, AuditLogPage)}
      </Route>
      <Route path="/feature-flags">
        {withAdmin(PERMISSIONS.FEATURE_FLAG_MANAGE, FeatureFlagsPage)}
      </Route>
      <Route path="/system">{withAdmin(PERMISSIONS.SYSTEM_READ, SystemPage)}</Route>
      <Route path="/cms/entries/:entryId">
        {withAdmin(PERMISSIONS.CONTENT_READ, CmsEntryDetailRoute)}
      </Route>
      <Route path="/cms/entries">
        {withAdmin(PERMISSIONS.CONTENT_READ, CmsEntriesPage)}
      </Route>
      <Route path="/cms/media">
        {withAdmin(PERMISSIONS.MEDIA_MANAGE, CmsMediaPage)}
      </Route>
      <Route path="/cms/seo">
        {withAdmin(PERMISSIONS.CONTENT_MANAGE, CmsSeoPage)}
      </Route>
      <Route path="/cms/approvals">
        {withAdmin(PERMISSIONS.CONTENT_PUBLISH, CmsApprovalsPage)}
      </Route>
      <Route path="/cms">{withAdmin(PERMISSIONS.CONTENT_READ, CmsDashboardPage)}</Route>
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
