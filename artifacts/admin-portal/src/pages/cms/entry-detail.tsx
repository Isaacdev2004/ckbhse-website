import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  getAdminCmsGetEntryQueryKey,
  useAdminCmsApproveClientEntry,
  useAdminCmsArchiveEntry,
  useAdminCmsGetEntry,
  useAdminCmsPublishEntry,
  useAdminCmsRollbackEntry,
  useAdminCmsScheduleEntry,
  useAdminCmsUpdateDraft,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';
import { CmsVisualEditor } from '@/components/cms/cms-visual-editor';

export default function CmsEntryDetailPage({ entryId }: { entryId: string }) {
  const queryClient = useQueryClient();
  const detail = useAdminCmsGetEntry(entryId);
  const updateDraft = useAdminCmsUpdateDraft();
  const publish = useAdminCmsPublishEntry({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAdminCmsGetEntryQueryKey(entryId),
        });
      },
    },
  });
  const approveClient = useAdminCmsApproveClientEntry({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAdminCmsGetEntryQueryKey(entryId),
        });
      },
    },
  });
  const schedule = useAdminCmsScheduleEntry({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAdminCmsGetEntryQueryKey(entryId),
        });
      },
    },
  });
  const archive = useAdminCmsArchiveEntry({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAdminCmsGetEntryQueryKey(entryId),
        });
      },
    },
  });
  const rollback = useAdminCmsRollbackEntry({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAdminCmsGetEntryQueryKey(entryId),
        });
      },
    },
  });

  const data = detail.data;
  const needsApproval = data?.requiresClientApproval && !data?.clientApprovedAt;
  const canPublish =
    data?.status !== 'published' && data?.status !== 'archived' && !needsApproval;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {data?.title ?? 'Content entry'}
            </h1>
            <p className="text-sm text-muted-foreground">{data?.path}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/cms/entries">Back to list</Link>
            </Button>
            {needsApproval ? (
              <Button
                size="sm"
                disabled={approveClient.isPending}
                onClick={() => void approveClient.mutateAsync({ entryId })}
              >
                Record client approval
              </Button>
            ) : null}
            <Button
              size="sm"
              disabled={publish.isPending || !canPublish}
              onClick={() => void publish.mutateAsync({ entryId })}
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={archive.isPending || data?.status === 'archived'}
              onClick={() => void archive.mutateAsync({ entryId })}
            >
              Archive
            </Button>
          </div>
        </div>

        {detail.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(detail.error as Error)?.message ?? 'Failed to load entry'}
          </div>
        ) : null}

        {needsApproval ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            Client approval is required before this entry can be published.
          </div>
        ) : null}

        {detail.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['Type', data?.contentType],
                ['Status', data?.status],
                ['Version', data?.versionNumber],
                [
                  'Client approval',
                  data?.requiresClientApproval
                    ? data?.clientApprovedAt
                      ? 'Approved'
                      : 'Pending'
                    : 'Not required',
                ],
              ].map(([label, value]) => (
                <Card key={String(label)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm font-medium">{String(value ?? '—')}</CardContent>
                </Card>
              ))}
            </div>

            <CmsVisualEditor
              payload={data?.payload ?? {}}
              contentType={data?.contentType ?? 'corporate'}
              disabled={data?.status === 'archived'}
              onSave={async (nextPayload, changeSummary) => {
                await updateDraft.mutateAsync({
                  entryId,
                  data: { payload: nextPayload, changeSummary },
                });
                await queryClient.invalidateQueries({
                  queryKey: getAdminCmsGetEntryQueryKey(entryId),
                });
              }}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule publish</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="scheduled-at">Publish at</Label>
                  <Input
                    id="scheduled-at"
                    type="datetime-local"
                    disabled={schedule.isPending || data?.status === 'archived'}
                    onChange={(event) => {
                      const value = event.target.value;
                      event.currentTarget.dataset.value = value;
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="review-due">Review due (optional)</Label>
                  <Input
                    id="review-due"
                    type="datetime-local"
                    disabled={schedule.isPending || data?.status === 'archived'}
                    onChange={(event) => {
                      const value = event.target.value;
                      event.currentTarget.dataset.value = value;
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={schedule.isPending || data?.status === 'archived'}
                    onClick={() => {
                      const scheduledInput = document.getElementById(
                        'scheduled-at',
                      ) as HTMLInputElement | null;
                      const reviewInput = document.getElementById(
                        'review-due',
                      ) as HTMLInputElement | null;
                      const scheduledAt = scheduledInput?.value;
                      if (!scheduledAt) {
                        return;
                      }
                      void schedule.mutateAsync({
                        entryId,
                        data: {
                          scheduledAt: new Date(scheduledAt).toISOString(),
                          reviewDueAt: reviewInput?.value
                            ? new Date(reviewInput.value).toISOString()
                            : undefined,
                        },
                      });
                    }}
                  >
                    Schedule publish
                  </Button>
                  {data?.scheduledAt ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Scheduled for {new Date(data.scheduledAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Version history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data?.versions ?? []).map((version) => (
                  <div
                    key={version.id}
                    className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        v{version.versionNumber}
                        {version.isPublished ? ' · live' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {version.changeSummary ?? 'No summary'} ·{' '}
                        {new Date(version.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!version.isPublished ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={rollback.isPending}
                        onClick={() =>
                          void rollback.mutateAsync({
                            entryId,
                            data: { versionId: version.id },
                          })
                        }
                      >
                        Roll back
                      </Button>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
