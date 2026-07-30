import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { PortalLayout } from '@/components/portal-layout';
import { portalFetch } from '@/lib/portal-api';

interface DashboardData {
  organizationName: string;
  complianceScore: number | null;
  healthScore: number | null;
  openActions: number;
  expiringCertificates: number;
  openSupportTickets: number;
  upcomingAudits: Array<{ id: string; title: string; scheduledAt: string }>;
  recentDocuments: Array<{ id: string; name: string; category: string | null }>;
  recentActivities: Array<{ id: string; summary: string; kind: string }>;
  activeProjects: Array<{
    id: string;
    name: string;
    progressPercent: number;
  }>;
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['portal', 'dashboard'],
    queryFn: () => portalFetch<DashboardData>('/dashboard'),
  });

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {data?.organizationName ?? 'Organisation dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Compliance, delivery, and support overview
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/support">Create support ticket</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/documents">Upload document</Link>
            </Button>
          </div>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load dashboard'}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))
            : [
                { label: 'Compliance score', value: data?.complianceScore ?? '—' },
                { label: 'Health score', value: data?.healthScore ?? '—' },
                { label: 'Open actions', value: data?.openActions ?? 0 },
                {
                  label: 'Certificates expiring',
                  value: data?.expiringCertificates ?? 0,
                },
              ].map((metric) => (
                <Card key={metric.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tabular-nums">
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                data?.activeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span>{project.name}</span>
                    <span className="text-muted-foreground">
                      {project.progressPercent}%
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                data?.recentActivities.map((activity) => (
                  <div key={activity.id} className="rounded-md border p-3">
                    <div className="text-xs uppercase text-muted-foreground">
                      {activity.kind}
                    </div>
                    <div>{activity.summary}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
