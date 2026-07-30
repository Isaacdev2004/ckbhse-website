import { PortalListPage } from './portal-list-page';

export default function UsersPage() {
  return (
    <PortalListPage
      title="Organisation members"
      description="Manage users, roles, and access within your organisation"
      path="/users"
      renderItem={(item) => {
        const user = item.user as Record<string, unknown> | undefined;
        const member = item.member as Record<string, unknown> | undefined;
        return (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">
                {String(user?.firstName ?? '')} {String(user?.lastName ?? '')}
              </div>
              <div className="text-sm text-muted-foreground">
                {String(user?.email ?? '')}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {String(member?.department ?? '—')} · {String(member?.status ?? '')}
            </div>
          </div>
        );
      }}
    />
  );
}
