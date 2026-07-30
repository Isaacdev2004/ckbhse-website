import { useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  getAdminCmsListSeoQueryKey,
  useAdminCmsListSeo,
  useAdminCmsUpdateSeo,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function CmsSeoPage() {
  const seo = useAdminCmsListSeo();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const updateSeo = useAdminCmsUpdateSeo({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getAdminCmsListSeoQueryKey() });
        setEditingId(null);
      },
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">SEO administration</h1>
            <p className="text-sm text-muted-foreground">
              Edit title and description metadata for CMS entries
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/cms">CMS overview</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {seo.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              (seo.data?.items ?? []).map((entry) => {
                const seoTitle =
                  typeof entry.seo.title === 'string' ? entry.seo.title : '';
                const seoDescription =
                  typeof entry.seo.description === 'string'
                    ? entry.seo.description
                    : '';
                const isEditing = editingId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="space-y-2 rounded-md border border-border p-3 text-sm"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{entry.title}</p>
                        <p className="text-xs text-muted-foreground">{entry.path}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.contentType} · {entry.status}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="SEO title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                        />
                        <Input
                          placeholder="SEO description"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={updateSeo.isPending}
                            onClick={() =>
                              void updateSeo.mutateAsync({
                                entryId: entry.id,
                                data: {
                                  seo: {
                                    ...entry.seo,
                                    title,
                                    description,
                                  },
                                },
                              })
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Title: {seoTitle || '—'}</p>
                        <p>Description: {seoDescription || '—'}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(entry.id);
                            setTitle(seoTitle);
                            setDescription(seoDescription);
                          }}
                        >
                          Edit SEO
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
