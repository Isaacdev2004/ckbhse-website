import { Redirect } from 'wouter';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@workspace/ui/components/skeleton';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
}
