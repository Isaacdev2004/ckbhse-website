import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  getAdminCmsDashboardQueryKey,
  getAdminCmsListEntriesQueryKey,
  useAdminCmsDashboard,
  useAdminCmsImportFromFiles,
  useAdminCmsListEntries,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function CmsDashboardPage() {
  const dashboard = useAdminCmsDashboard();
  const entries = useAdminCmsListEntries({ status: 'draft' });
  const queryClient = useQueryClient();
  const importMutation = useAdminCmsImportFromFiles({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getAdminCmsDashboardQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getAdminCmsListEntriesQueryKey() }),
        ]);
      },
    },
  });

  const data = dashboard.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CMS</h1>
            <p className="text-sm text-muted-foreground">
              Versioned public content — import from files or manage entries
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/cms/entries">Browse entries</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/cms/media">Media library</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/cms/seo">SEO admin</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/cms/approvals">Client approvals</Link>
            </Button>
            <Button
              size="sm"
              disabled={importMutation.isPending}
              onClick={() =>
                void importMutation.mutateAsync({ data: { skipExisting: true } })
              }
            >
              {importMutation.isPending ? 'Importing…' : 'Import from files'}
            </Button>
          </div>
        </div>

        {dashboard.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(dashboard.error as Error)?.message ?? 'Failed to load CMS dashboard'}
          </div>
        ) : null}

        {importMutation.isSuccess ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            Imported {importMutation.data.imported}, skipped {importMutation.data.skipped}
            {importMutation.data.errors.length > 0
              ? ` — ${importMutation.data.errors.length} errors`
              : ''}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {dashboard.isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))
            : [
                ['Total entries', data?.totalEntries],
                ['Published', data?.publishedEntries],
                ['Drafts', data?.draftEntries],
                ['Archived', data?.archivedEntries],
                ['Review overdue', data?.pendingReviewEntries],
                ['Awaiting client approval', data?.pendingClientApprovalEntries],
              ].map(([label, value]) => (
                <Card key={String(label)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-bold">{String(value ?? 0)}</CardContent>
                </Card>
              ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entries.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              (entries.data?.items ?? []).slice(0, 8).map((entry) => (
                <Link
                  key={entry.id}
                  href={`/cms/entries/${entry.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{entry.path}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.contentType}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
