import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { PortalLayout } from '@/components/portal-layout';
import { portalFetch } from '@/lib/portal-api';

export default function OrganisationPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['portal', 'organisation'],
    queryFn: () => portalFetch<Record<string, unknown>>('/organisation'),
  });

  const profile = (data?.profile ?? {}) as Record<string, unknown>;

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organisation</h1>
          <p className="text-sm text-muted-foreground">
            Company profile, contacts, and account details
          </p>
        </div>
        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message}
          </div>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>{String(data?.name ?? 'Organisation')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div>
                  <div className="text-muted-foreground">Industry</div>
                  <div>{String(profile.industry ?? '—')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Registration</div>
                  <div>{String(profile.registrationNumber ?? '—')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Primary contact</div>
                  <div>{String(profile.primaryContactName ?? '—')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Account tier</div>
                  <div>{String(profile.accountTier ?? '—')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Compliance score</div>
                  <div>{String(profile.complianceScore ?? '—')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Health score</div>
                  <div>{String(profile.healthScore ?? '—')}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
