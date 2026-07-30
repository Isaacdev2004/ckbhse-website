import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  getAdminCmsListMediaQueryKey,
  useAdminCmsListMedia,
  useAdminCmsUploadMedia,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function CmsMediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [key, setKey] = useState('');
  const [altText, setAltText] = useState('');
  const queryClient = useQueryClient();
  const media = useAdminCmsListMedia();
  const upload = useAdminCmsUploadMedia({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getAdminCmsListMediaQueryKey() });
        setKey('');
        setAltText('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Media library</h1>
            <p className="text-sm text-muted-foreground">
              Upload and browse CMS media assets
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/cms">CMS overview</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload asset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Asset key (e.g. hero/home-banner)"
              value={key}
              onChange={(event) => setKey(event.target.value)}
            />
            <Input
              placeholder="Alt text (optional)"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
            />
            <Input ref={fileInputRef} type="file" accept="image/*" />
            <Button
              disabled={upload.isPending || key.trim().length === 0}
              onClick={() => {
                const file = fileInputRef.current?.files?.[0];
                if (!file) return;
                void (async () => {
                  const dataBase64 = await fileToBase64(file);
                  await upload.mutateAsync({
                    data: {
                      key: key.trim(),
                      filename: file.name,
                      mimeType: file.type || 'application/octet-stream',
                      dataBase64,
                      altText: altText.trim().length > 0 ? altText.trim() : null,
                    },
                  });
                })();
              }}
            >
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
            {upload.isError ? (
              <p className="text-sm text-destructive">
                {(upload.error as Error)?.message ?? 'Upload failed'}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {media.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              (media.data?.items ?? []).map((asset) => (
                <div
                  key={asset.id}
                  className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{asset.filename}</p>
                    <p className="text-xs text-muted-foreground">{asset.key}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>{asset.mimeType}</span>
                    <a
                      href={asset.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Open
                    </a>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
