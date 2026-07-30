import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminCmsListEntries } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function CmsEntriesPage() {
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, error } = useAdminCmsListEntries({
    ...(search !== undefined ? { keyword: search } : {}),
    ...(status !== undefined ? { status } : {}),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Content entries</h1>
            <p className="text-sm text-muted-foreground">All CMS records by path and status</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/cms">CMS overview</Link>
          </Button>
        </div>

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(keyword.trim().length > 0 ? keyword.trim() : undefined);
          }}
        >
          <Input
            placeholder="Search title, slug, or path…"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select
            className="rounded-md border border-border bg-card px-3 py-2 text-sm"
            value={status ?? ''}
            onChange={(event) =>
              setStatus(event.target.value.length > 0 ? event.target.value : undefined)
            }
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load entries'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              (data?.items ?? []).map((entry) => (
                <Link
                  key={entry.id}
                  href={`/cms/entries/${entry.id}`}
                  className="flex flex-col gap-1 rounded-md border border-border p-3 text-sm hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{entry.path}</p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{entry.contentType}</span>
                    <span>{entry.status}</span>
                    <span>v{entry.versionNumber ?? '—'}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
