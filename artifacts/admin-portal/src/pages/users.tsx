import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAdminListUsers } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';

export default function UsersPage() {
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, error } = useAdminListUsers(
    search !== undefined ? { keyword: search } : undefined,
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Platform user directory</p>
        </div>

        <form
          className="flex max-w-md gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(keyword.trim().length > 0 ? keyword.trim() : undefined);
          }}
        >
          <Input
            placeholder="Search by name or email…"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load users'}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              (data?.items ?? []).map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-1 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-muted-foreground">{user.status}</span>
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded bg-muted px-2 py-0.5 text-muted-foreground"
                      >
                        {role}
                      </span>
                    ))}
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
