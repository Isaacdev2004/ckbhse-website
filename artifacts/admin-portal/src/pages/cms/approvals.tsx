import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminCmsListPendingApprovals } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function CmsApprovalsPage() {
  const approvals = useAdminCmsListPendingApprovals();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Client approvals</h1>
          <p className="text-sm text-muted-foreground">
            Entries flagged for client sign-off before publish
          </p>
        </div>

        {approvals.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(approvals.error as Error)?.message ?? 'Failed to load approvals'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {approvals.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (approvals.data?.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries awaiting client approval.</p>
            ) : (
              (approvals.data?.items ?? []).map((entry) => (
                <Link
                  key={entry.id}
                  href={`/cms/entries/${entry.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{entry.path}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.status}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
