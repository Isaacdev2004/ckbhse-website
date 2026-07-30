import type { Permission } from '@workspace/platform/permissions';
import { Redirect } from 'wouter';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@workspace/ui/components/skeleton';

export function PermissionRoute({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { session, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/unauthorized" />;
  if (session === undefined || !session.permissions.includes(permission)) {
    return <Redirect to="/forbidden" />;
  }
  return <>{children}</>;
}
