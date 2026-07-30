import { PortalListPage } from './portal-list-page';

export default function MessagesPage() {
  return (
    <PortalListPage
      title="Messages"
      description="Secure conversations with your CKBHSE team"
      path="/messages"
      renderItem={(item) => (
        <div>
          <div className="font-medium">{String(item.subject ?? '')}</div>
          <div className="text-sm text-muted-foreground">
            Last message {String(item.lastMessageAt ?? '')}
          </div>
        </div>
      )}
    />
  );
}
