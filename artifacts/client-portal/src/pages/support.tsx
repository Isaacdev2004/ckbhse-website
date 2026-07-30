import { PortalListPage } from './portal-list-page';

export default function SupportPage() {
  return (
    <PortalListPage
      title="Support centre"
      description="Raise and track support tickets with your consultant"
      path="/support"
      renderItem={(item) => (
        <div>
          <div className="font-medium">{String(item.subject ?? '')}</div>
          <div className="text-sm text-muted-foreground">
            {String(item.priority ?? '')} · {String(item.status ?? '')}
          </div>
        </div>
      )}
    />
  );
}
